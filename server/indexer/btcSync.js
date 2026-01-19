const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');

const prisma = new PrismaClient();
async function rpcCall(method, params = []) {
  const response = await axios.post(BTC_RPC_URL, {
    jsonrpc: "1.0",
    id: "indexer",
    method,
    params
  }, { timeout: 20000 });
  
  if (response.data.error) {
    throw new Error(`RPC Error (${method}): ${response.data.error.message || response.data.error}`);
  }
  return response.data.result;
}

async function processBtcBlock(blockHeight) {
  try {
    console.log(`[BTC] Fetching block height via RPC: ${blockHeight}`);
    
    // 1. Get block hash from height
    const blockHash = await rpcCall("getblockhash", [blockHeight]);

    // 2. Get full block details (verbosity 2 for full tx details)
    const block = await rpcCall("getblock", [blockHash, 2]);
    const timestamp = new Date(block.time * 1000);

    // 3. Store block record
    await prisma.block.upsert({
      where: { number_chain: { number: BigInt(blockHeight), chain: "BTC" } },
      update: {},
      create: {
        number: BigInt(blockHeight),
        hash: blockHash,
        chain: "BTC",
        timestamp: timestamp
      }
    });

    // 4. Index first 50 transactions
    const txsToProcess = block.tx.slice(0, 50);
    let successCount = 0;

    for (const tx of txsToProcess) {
      try {
        // Calculate total output value (satoshi to BTC)
        const totalValue = tx.vout.reduce((acc, v) => acc + (v.value || 0), 0);
        
        // Find first valid address in outputs
        // Bitcoin RPC format for vout address depends on version, usually scriptPubKey.address
        const toAddress = tx.vout.find(v => v.scriptPubKey?.address)?.scriptPubKey.address 
                       || tx.vout[0]?.scriptPubKey?.addresses?.[0] 
                       || "unknown";

        await prisma.transaction.upsert({
          where: { hash_chain: { hash: tx.txid, chain: "BTC" } },
          update: {},
          create: {
            hash: tx.txid,
            from: "BTC-Network",
            to: toAddress,
            value: totalValue.toFixed(8),
            asset: "BTC",
            chain: "BTC",
            blockNum: BigInt(blockHeight),
            timestamp: timestamp
          }
        });
        successCount++;
      } catch (e) {
        // Skip failed individual transactions
      }
    }

    console.log(`[BTC] Indexed ${successCount} transactions from block ${blockHeight}`);
    return true;
  } catch (error) {
    console.error(`[BTC RPC Sync Error] Block ${blockHeight}:`, error.message);
    return false;
  }
}

let lastProcessedHeight = 0;
let isSyncing = false;

async function syncBtc() {
  if (isSyncing) return;
  isSyncing = true;
  console.log("[BTC] Checking for new blocks via RPC...");

  try {
    // Get latest block height
    const currentHeight = await rpcCall("getblockcount");
    console.log(`[BTC] Network tip: ${currentHeight}`);

    if (!lastProcessedHeight || lastProcessedHeight === 0) {
      const lastBlockInDb = await prisma.block.findFirst({
        where: { chain: "BTC" },
        orderBy: { number: 'desc' }
      });
      lastProcessedHeight = lastBlockInDb ? Number(lastBlockInDb.number) : currentHeight - 1;
      console.log(`[BTC] Resuming from height ${lastProcessedHeight}`);
    }

    if (lastProcessedHeight >= currentHeight) {
      console.log("[BTC] Already up to date.");
    }

    for (let h = lastProcessedHeight + 1; h <= currentHeight; h++) {
      const success = await processBtcBlock(h);
      if (success) {
        lastProcessedHeight = h;
      } else {
        break;
      }
    }
  } catch (error) {
    console.error("[BTC RPC Sync Task Error]:", error.message);
  } finally {
    isSyncing = false;
  }
}

function startBtcIndexer() {
  console.log("🚀 Starting Bitcoin Cron Indexer (JSON-RPC)...");
  syncBtc();
  cron.schedule('*/10 * * * *', syncBtc); 
}

module.exports = { startBtcIndexer };
