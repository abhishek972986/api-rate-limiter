const ApiKey = require('../models/ApiKey');
const RateLimitUsage = require('../models/RateLimitUsage');

/**
 * Service for handling API key operations
 */
class ApiKeyService {
  /**
   * Get an API key by its value
   * @param {String} key - The API key to look up
   * @returns {Promise<Object>} The API key document
   */
  async getApiKey(key) {
    return ApiKey.findOne({ key, isActive: true });
  }

  /**
   * Get rate limit statistics for a specific API key
   * @param {String} key - The API key
   * @param {String} path - Optional specific endpoint path
   * @param {String} method - Optional HTTP method
   * @returns {Promise<Object>} Rate limit statistics
   */
  async getRateLimitStats(key, path, method) {
    // Find the API key
    const apiKey = await this.getApiKey(key);
    
    if (!apiKey) {
      throw new Error('Invalid or inactive API key');
    }

    if (apiKey.isExpired()) {
      throw new Error('API key has expired');
    }

    // Find the applicable rate limit configuration
    const customLimit = path && apiKey.customRateLimits.find(limit => 
      limit.endpoints.some(endpoint => 
        endpoint.path === path && (endpoint.method === method || endpoint.method === 'ALL')
      )
    );
    
    const rateLimit = customLimit || apiKey.defaultRateLimit;
    const { limit, window } = rateLimit;
    
    // Get request history within the current window
    const windowMs = window * 1000; // Convert seconds to milliseconds
    const requestTimestamps = await RateLimitUsage.getRequestTimestamps(key, path, method, windowMs);
    
    // Calculate the window start time and reset time
    const now = Date.now();
    const windowStartTime = now - windowMs;
    const resetTime = new Date(windowStartTime + windowMs);
    
    // Count requests in the current window
    const requestsInWindow = requestTimestamps.length;
    
    return {
      limit,
      used: requestsInWindow,
      remaining: Math.max(0, limit - requestsInWindow),
      resetAt: resetTime,
      window: `${window} seconds`,
      path: path || 'all endpoints',
      method: method || 'ALL'
    };
  }
}

module.exports = new ApiKeyService();