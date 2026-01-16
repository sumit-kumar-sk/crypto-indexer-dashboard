/**
 * Alchemy Service Layer
 * 
 * This service handles all interactions with Alchemy's indexed blockchain APIs.
 * It uses the alchemy_getAssetTransfers endpoint which provides pre-indexed
 * transaction data, eliminating the need for manual block scanning.
 * 
 * Security: API key is accessed from process.env and never exposed to clients.
 */

const axios = require('axios');

/**
 * Validates if a string is a valid Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid Ethereum address
 */
function isValidEthereumAddress(address) {
  // Ethereum addresses are 42 characters: 0x + 40 hex characters
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
}

/**
 * Fetches asset transfers (ETH and ERC-20) for a given Ethereum address
 * Uses Alchemy's indexed API for fast, efficient data retrieval
 * 
 * @param {string} address - Ethereum wallet address
 * @returns {Promise<Array>} Array of normalized transaction objects
 */
async function getTransactionsForAddress(address) {
  // Validate address format
  if (!isValidEthereumAddress(address)) {
    throw new Error('Invalid Ethereum address format');
  }

  const apiKey = process.env.ALCHEMY_API_KEY;
  const alchemyUrl = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;

  try {
    // Fetch both incoming and outgoing transfers
    // We make two requests to get complete transaction history
    const [sentTransfers, receivedTransfers] = await Promise.all([
      // Outgoing transfers (from this address)
      axios.post(alchemyUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: '0x0',
            fromAddress: address,
            category: ['external', 'erc20'], // ETH and ERC-20 tokens
            withMetadata: true,
            excludeZeroValue: true,
            maxCount: '0x32' // Limit to 50 transactions
          }
        ]
      }),
      // Incoming transfers (to this address)
      axios.post(alchemyUrl, {
        jsonrpc: '2.0',
        id: 2,
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: '0x0',
            toAddress: address,
            category: ['external', 'erc20'], // ETH and ERC-20 tokens
            withMetadata: true,
            excludeZeroValue: true,
            maxCount: '0x32' // Limit to 50 transactions
          }
        ]
      })
    ]);

    // Extract transfer data from responses
    const sentData = sentTransfers.data.result?.transfers || [];
    const receivedData = receivedTransfers.data.result?.transfers || [];

    // Combine and normalize all transfers
    const allTransfers = [...sentData, ...receivedData];

    // Normalize transaction data to consistent format
    const normalizedTransactions = allTransfers.map(transfer => ({
      hash: transfer.hash,
      from: transfer.from,
      to: transfer.to || 'Contract Creation',
      value: transfer.value ? parseFloat(transfer.value).toFixed(6) : '0',
      asset: transfer.asset || 'ETH',
      timestamp: transfer.metadata?.blockTimestamp || 'N/A',
      blockNum: transfer.blockNum
    }));

    // Sort by block number (most recent first)
    normalizedTransactions.sort((a, b) => {
      const blockA = parseInt(a.blockNum, 16);
      const blockB = parseInt(b.blockNum, 16);
      return blockB - blockA;
    });

    return normalizedTransactions;

  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // Alchemy API returned an error response
      const status = error.response.status;
      const errorData = error.response.data;
      
      // Log detailed error for debugging
      console.error('Alchemy API Error Details:', {
        status,
        data: errorData,
        url: alchemyUrl.replace(apiKey, 'REDACTED')
      });
      
      const message = errorData?.error?.message || errorData?.message || 'Alchemy API error';

      if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (status === 401 || status === 403) {
        throw new Error('Invalid API key. Please check your Alchemy configuration.');
      } else {
        throw new Error(`Alchemy API error: ${message}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to reach Alchemy API. Please check your internet connection.');
    } else {
      // Other errors
      throw new Error(error.message || 'Failed to fetch transactions');
    }
  }
}

module.exports = {
  getTransactionsForAddress,
  isValidEthereumAddress
};
