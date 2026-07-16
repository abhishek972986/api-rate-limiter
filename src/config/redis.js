const Redis = require('ioredis');

/**
 * Redis client configuration
 */
let redisClient = null;

/**
 * Initialize Redis connection
 * @returns {Redis} Redis client instance
 */
const initRedis = () => {
  if (redisClient) return redisClient;

  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    // If there's a connection error, the client will try to reconnect automatically
    retryStrategy: (times) => {
      // Maximum retry delay is 3 seconds
      const delay = Math.min(times * 100, 3000);
      return delay;
    }
  };

  redisClient = new Redis(redisConfig);

  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  return redisClient;
};

/**
 * Get Redis client instance
 * @returns {Redis} Redis client instance
 */
const getRedisClient = () => {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};

module.exports = {
  initRedis,
  getRedisClient
};