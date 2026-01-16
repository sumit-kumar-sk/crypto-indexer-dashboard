const { startEthIndexer } = require('./ethSync');
const { startBtcIndexer } = require('./btcSync');

/**
 * Initializes and starts all blockchain indexers
 */
async function initIndexers() {
  console.log("🛠️ Initializing Blockchain Indexers...");
  
  try {
    // Start indexers (internal cron management)
    startEthIndexer();
    startBtcIndexer();
  } catch (err) {
    console.error("❌ Error during indexer startup:", err.message);
  }
}

module.exports = { initIndexers };
