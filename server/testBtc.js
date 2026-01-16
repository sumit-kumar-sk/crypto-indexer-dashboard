const axios = require('axios');
const BTC_RPC_URL = "https://blockstream.info/api";

async function test() {
  console.log("Testing Blockstream API...");
  try {
    const tipRes = await axios.get(`${BTC_RPC_URL}/blocks/tip/height`, { timeout: 10000 });
    console.log("Tip Height:", tipRes.data);
    
    const height = tipRes.data;
    const hashRes = await axios.get(`${BTC_RPC_URL}/block-height/${height}`, { timeout: 10000 });
    console.log("Block Hash:", hashRes.data);
    
    const blockRes = await axios.get(`${BTC_RPC_URL}/block/${hashRes.data}`, { timeout: 10000 });
    console.log("Block ID:", blockRes.data.id);
    
    const txsRes = await axios.get(`${BTC_RPC_URL}/block/${hashRes.data}/txs/0`, { timeout: 10000 });
    console.log("Transactions Count:", txsRes.data.length);
    
    const firstTx = txsRes.data[0];
    const totalValue = firstTx.vout.reduce((acc, v) => acc + (v.value || 0), 0);
    const toAddress = firstTx.vout.find(v => v.scriptpubkey_address)?.scriptpubkey_address || "unknown";
    
    console.log("First TX Hash:", firstTx.txid);
    console.log("First TX Value:", totalValue / 1e8);
    console.log("First TX To:", toAddress);
    
    console.log("SUCCESS: All API calls worked.");
  } catch (err) {
    console.error("FAILURE:", err.message);
    console.error("Error Name:", err.name);
    console.error("Error Code:", err.code);
    console.error("Error Stack:", err.stack);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    }
  }
}

test();
