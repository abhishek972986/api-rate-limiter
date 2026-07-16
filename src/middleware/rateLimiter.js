const { getRedisClient } = require('../config/redis');
const RateLimitUsage = require('../models/RateLimitUsage');
const ApiKey = require('../models/ApiKey');

/**
 * Redis-based rate limiting middleware
 * Enforces rate limits per API key using Redis for counters
 * Default: 20 requests per 360 seconds (6 minutes)
 * 
 * @param {Object} options - Configuration options
 * @param {Number} options.limit - Maximum number of requests allowed in the window (default: 20)
 * @param {Number} options.windowSec - Time window in seconds (default: 360)
 * @returns {Function} Express middleware function
 */
const rateLimiter = (options = {}) => {
  const limit = options.limit || 20;
  const windowSec = options.windowSec || 360;
  const windowMs = windowSec * 1000;
  
  const redisClient = getRedisClient();
  
  return async (req, res, next) => {
    try {
      // Get API key from request header
      const apiKey = req.headers['x-api-key'];
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: { message: 'API key is required' }
        });
      }
      
      // Check if API key exists in database
      const keyExists = await ApiKey.findOne({ key: apiKey, isActive: true });
      
      if (!keyExists) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid or inactive API key' }
        });
      }
      
      if (keyExists.isExpired()) {
        return res.status(403).json({
          success: false,
          error: { message: 'API key has expired' }
        });
      }

      const path = req.path;
      const method = req.method;
      
      // Create unique Redis key for this API key and endpoint
      // Format: ratelimit:{apiKey}:{path}:{method}
      const redisKey = `ratelimit:${apiKey}:${path}:${method}`;
      
      // Get current count and timestamp from Redis
      const [count, timestamp] = await redisClient.multi()
        .incr(redisKey)
        .pttl(redisKey)
        .exec();
        
      // If this is the first request, set the expiry
      if (count[1] === 1) {
        await redisClient.expire(redisKey, windowSec);
      }
      
      // Calculate remaining requests and reset time
      const currentCount = count[1];
      const ttl = timestamp[1] < 0 ? windowMs : timestamp[1]; // if key doesn't exist, use full window
      const resetTime = new Date(Date.now() + ttl);
      const remaining = Math.max(0, limit - currentCount);
      
      // Add rate limit headers to response
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.floor(resetTime.getTime() / 1000));
      
      // Check if the rate limit has been exceeded
      if (currentCount > limit) {
        return res.status(429).json({
          success: false,
          error: {
            message: 'Rate limit exceeded',
            limit,
            remaining: 0,
            resetAt: resetTime
          }
        });
      }
      
      // Store request data for analytics
      const requestStart = Date.now();
      
      // Store original end method to capture response data
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        // Calculate response time
        const responseTime = Date.now() - requestStart;
        
        // Restore original end method and apply it
        res.end = originalEnd;
        res.end(chunk, encoding);
        
        // Store request data asynchronously (don't wait)
        const usageData = new RateLimitUsage({
          apiKey,
          endpoint: {
            path,
            method
          },
          timestamp: new Date(),
          responseStatus: res.statusCode,
          responseTime,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'] || 'unknown'
        });
        
        usageData.save().catch(err => {
          console.error('Error saving rate limit usage data:', err);
        });
        
        // Update the API key usage statistics
        ApiKey.updateOne(
          { key: apiKey },
          { 
            $inc: { 'usage.totalRequests': 1 },
            $set: { 'usage.lastRequest': new Date() }
          }
        ).catch(err => {
          console.error('Error updating API key usage stats:', err);
        });
      };
      
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(error);
    }
  };
};

module.exports = rateLimiter;