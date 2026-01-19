const Redis = require('ioredis');

// Redis client configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redis = null;
let isConnected = false;

function initRedis() {
  if (redis) return redis;

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: true
    });

    redis.on('connect', () => {
      console.log('🔴 Redis connected successfully');
      isConnected = true;
    });

    redis.on('error', (err) => {
      console.warn('⚠️ Redis connection error:', err.message);
      isConnected = false;
    });

    redis.on('close', () => {
      console.log('🔴 Redis connection closed');
      isConnected = false;
    });

    // Attempt to connect
    redis.connect().catch((err) => {
      console.warn('⚠️ Redis initial connection failed:', err.message);
      console.log('📢 Caching is disabled. App will continue without Redis.');
    });

    return redis;
  } catch (err) {
    console.warn('⚠️ Failed to initialize Redis:', err.message);
    return null;
  }
}

async function getCache(key) {
  if (!redis || !isConnected) return null;
  
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (err) {
    console.warn('Cache get error:', err.message);
    return null;
  }
}

/**
 * Set cache value with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttlSeconds - Time to live in seconds (default: 30)
 */
async function setCache(key, value, ttlSeconds = 30) {
  if (!redis || !isConnected) return;
  
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    console.warn('Cache set error:', err.message);
  }
}

/**
 * Delete cache by key
 * @param {string} key - Cache key to delete
 */
async function delCache(key) {
  if (!redis || !isConnected) return;
  
  try {
    await redis.del(key);
  } catch (err) {
    console.warn('Cache delete error:', err.message);
  }
}

/**
 * Delete cache by pattern
 * @param {string} pattern - Pattern to match keys (e.g., "blocks:*")
 */
async function delCacheByPattern(pattern) {
  if (!redis || !isConnected) return;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.warn('Cache pattern delete error:', err.message);
  }
}

/**
 * Check if Redis is connected
 * @returns {boolean}
 */
function isRedisConnected() {
  return isConnected;
}

// Cache key generators
const CacheKeys = {
  blocks: (chain) => `blocks:${chain.toLowerCase()}`,
  allTransactions: (chain) => `all-tx:${chain.toLowerCase()}`,
  walletTransactions: (address) => `wallet:${address.toLowerCase()}`,
  singleTransaction: (hash) => `tx:${hash.toLowerCase()}`
};

// TTL values in seconds
const CacheTTL = {
  BLOCKS: 15,           // Blocks refresh frequently
  ALL_TRANSACTIONS: 15, // Global tx feed updates often
  WALLET: 60,           // Wallet queries cached longer
  SINGLE_TX: 300        // Single tx details cached longest
};

module.exports = {
  initRedis,
  getCache,
  setCache,
  delCache,
  delCacheByPattern,
  isRedisConnected,
  CacheKeys,
  CacheTTL
};
