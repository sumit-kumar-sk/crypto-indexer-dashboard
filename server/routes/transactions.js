const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { getCache, setCache, CacheKeys, CacheTTL } = require('../services/redis');

const prisma = new PrismaClient();

router.get('/blocks/:chain', async (req, res) => {
  const { chain } = req.params;
  const cacheKey = CacheKeys.blocks(chain);
  
  try {
    // Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const blocks = await prisma.block.findMany({
      where: { chain: chain.toUpperCase() },
      orderBy: { number: 'desc' },
      take: 15
    });
    
    const response = { 
      success: true, 
      blocks: blocks.map(b => ({ ...b, number: b.number.toString() })) 
    };
    
    // Cache the result
    await setCache(cacheKey, response, CacheTTL.BLOCKS);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/all-transactions/:chain', async (req, res) => {
  const { chain } = req.params;
  const cacheKey = CacheKeys.allTransactions(chain);
  
  try {
    // Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const transactions = await prisma.transaction.findMany({
      where: { chain: chain.toUpperCase() },
      orderBy: { timestamp: 'desc' },
      take: 30
    });
    
    const response = { 
      success: true, 
      transactions: transactions.map(tx => ({ ...tx, blockNum: tx.blockNum.toString() })) 
    };
    
    // Cache the result
    await setCache(cacheKey, response, CacheTTL.ALL_TRANSACTIONS);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/transactions/:address', async (req, res) => {
  const { address } = req.params;
  const searchAddr = address.trim();
  const cacheKey = CacheKeys.walletTransactions(searchAddr);
  
  try {
    // Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    // Validate address format
    const isEth = searchAddr.startsWith('0x') && searchAddr.length === 42;
    const isBtc = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(searchAddr);

    if (!isEth && !isBtc) {
      return res.status(400).json({ success: false, message: 'Invalid address format' });
    }

    // Search for transactions where address is sender or receiver
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { from: { equals: searchAddr, mode: 'insensitive' } },
          { to: { equals: searchAddr, mode: 'insensitive' } }
        ]
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const response = {
      success: true,
      address,
      chain: isEth ? 'ETH' : 'BTC',
      count: transactions.length,
      transactions: transactions.map(tx => ({ ...tx, blockNum: tx.blockNum.toString() }))
    };
    
    // Cache the result
    await setCache(cacheKey, response, CacheTTL.WALLET);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/transaction/:hash', async (req, res) => {
  const { hash } = req.params;
  const cacheKey = CacheKeys.singleTransaction(hash);
  
  try {
    // Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    // Find the transaction by hash
    const transaction = await prisma.transaction.findFirst({
      where: {
        hash: { equals: hash.trim(), mode: 'insensitive' }
      },
      include: {
        block: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found in indexed data' 
      });
    }

    const response = {
      success: true,
      transaction: {
        ...transaction,
        blockNum: transaction.blockNum.toString(),
        block: transaction.block ? {
          ...transaction.block,
          number: transaction.block.number.toString()
        } : null
      }
    };
    
    // Cache the result (transactions don't change, cache longer)
    await setCache(cacheKey, response, CacheTTL.SINGLE_TX);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
