const { createPublicClient, http } = require('viem');
const { mainnet } = require('viem/chains');
const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');

const prisma = new PrismaClient();

const ethClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETH_RPC_URL || `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`)
});

async function processEthBlock(block) {
  if (!block || !block.transactions) return;
  const timestamp = new Date(Number(block.timestamp) * 1000);
  
  await prisma.block.upsert({
    where: { number_chain: { number: BigInt(block.number), chain: "ETH" } },
    update: {},
    create: {
      number: BigInt(block.number),
      hash: block.hash,
      chain: "ETH",
      timestamp: timestamp
    }
  });

  const txsToStore = block.transactions
    .filter(tx => tx.value > 0n)
    .map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to || "Contract Creation",
      value: (Number(tx.value) / 1e18).toFixed(6),
      asset: "ETH",
      chain: "ETH",
      blockNum: BigInt(block.number),
      timestamp: timestamp
    }));

  if (txsToStore.length > 0) {
    for (const tx of txsToStore) {
      await prisma.transaction.upsert({
        where: { hash_chain: { hash: tx.hash, chain: "ETH" } },
        update: {},
        create: tx
      });
    }
    console.log(`[ETH] Indexed ${txsToStore.length} transactions from block ${block.number}`);
  }
}

let lastProcessedBlock = 0n;
let isSyncing = false;

async function syncEth() {
  if (isSyncing) return;
  isSyncing = true;
  
  try {
    const currentBlock = await ethClient.getBlockNumber();
    
    if (!lastProcessedBlock || lastProcessedBlock === 0n) {
      const lastBlockInDb = await prisma.block.findFirst({
        where: { chain: "ETH" },
        orderBy: { number: 'desc' }
      });
      lastProcessedBlock = lastBlockInDb ? BigInt(lastBlockInDb.number) : currentBlock - 2n;
    }

    for (let blockNum = lastProcessedBlock + 1n; blockNum <= currentBlock; blockNum++) {
      const block = await ethClient.getBlock({
        blockNumber: blockNum,
        includeTransactions: true
      });
      await processEthBlock(block);
      lastProcessedBlock = blockNum;
    }
  } catch (error) {
    console.error("[ETH Cron Error]:", error.message);
  } finally {
    isSyncing = false;
  }
}

function startEthIndexer() {
  console.log("🚀 Starting Ethereum Cron Indexer (Every 12s)...");
  cron.schedule('*/12 * * * * *', syncEth);
}

module.exports = { startEthIndexer };
