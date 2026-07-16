/**
 * Rate Limiter Client Library
 * A simple client to interact with the Rate Limiter service
 */
class RateLimiterClient {
  /**
   * Create a new Rate Limiter client
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - Your API key
   * @param {string} options.serviceUrl - URL of the Rate Limiter service
   * @param {number} options.timeout - Request timeout in milliseconds (default: 5000)
   */
  constructor(options = {}) {
    this.apiKey = options.apiKey;
    this.serviceUrl = options.serviceUrl || 'http://localhost:3000';
    this.timeout = options.timeout || 5000;
    this.authToken = null;
  }

  /**
   * Make an HTTP request to the Rate Limiter service
   * @private
   * @param {string} method - HTTP method
   * @param {string} path - API endpoint path
   * @param {Object} data - Request payload
   * @param {boolean} useAuth - Whether to include auth token
   * @returns {Promise<Object>} Response data
   */
  async _request(method, path, data = null, useAuth = true) {
    const url = `${this.serviceUrl}${path}`;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (useAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    const options = {
      method,
      headers,
      timeout: this.timeout,
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Request failed');
      }
      
      return responseData;
    } catch (error) {
      console.error('Rate Limiter API Error:', error);
      throw error;
    }
  }
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    const response = await this._request('POST', '/api/auth/register', userData, false);
    this.authToken = response.data.token;
    return response;
  }
  
  /**
   * Login with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Login response
   */
  async login(email, password) {
    const response = await this._request('POST', '/api/auth/login', { email, password }, false);
    this.authToken = response.data.token;
    return response;
  }
  
  /**
   * Set JWT token manually
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    this.authToken = token;
  }
  
  /**
   * Get user profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    return await this._request('GET', '/api/auth/profile');
  }
  
  /**
   * Create a new API key
   * @param {Object} keyData - API key configuration
   * @param {string} keyData.name - Name of the API key
   * @param {number} keyData.rateLimit - Rate limit (requests per window)
   * @param {string} keyData.expiresIn - Expiration period (e.g. '30d')
   * @returns {Promise<Object>} Created API key
   */
  async createApiKey(keyData) {
    return await this._request('POST', '/api/keys', keyData);
  }
  
  /**
   * Validate an API key
   * @param {string} key - API key to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateApiKey(key) {
    return await this._request('POST', '/api/keys/validate', { key });
  }
  
  /**
   * Get API key details
   * @param {string} key - API key
   * @returns {Promise<Object>} API key details
   */
  async getApiKeyDetails(key) {
    return await this._request('GET', `/api/keys/${key}`);
  }
  
  /**
   * Get rate limit statistics for an API key
   * @param {string} key - API key
   * @param {string} path - API path
   * @param {string} method - HTTP method
   * @returns {Promise<Object>} Rate limit statistics
   */
  async getRateLimitStats(key, path, method) {
    return await this._request('GET', `/api/keys/${key}/stats?path=${encodeURIComponent(path)}&method=${encodeURIComponent(method)}`);
  }
  
  /**
   * Update an API key
   * @param {string} key - API key to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated API key
   */
  async updateApiKey(key, updateData) {
    return await this._request('PUT', `/api/keys/${key}`, updateData);
  }
  
  /**
   * Delete an API key
   * @param {string} key - API key to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteApiKey(key) {
    return await this._request('DELETE', `/api/keys/${key}`);
  }
  
  /**
   * Create a rate limit override for an API key
   * @param {string} key - API key to override
   * @param {Object} overrideData - Override configuration
   * @param {number} overrideData.rateLimit - New rate limit value
   * @param {string} overrideData.path - Optional path to apply override to
   * @param {string} overrideData.method - Optional HTTP method to apply override to
   * @param {number} overrideData.duration - Duration in seconds for the override
   * @param {string} overrideData.reason - Optional reason for the override
   * @returns {Promise<Object>} Created override
   */
  async createRateLimitOverride(key, overrideData) {
    return await this._request('POST', `/api/keys/${key}/override`, overrideData);
  }
  
  /**
   * Get all rate limit overrides for an API key
   * @param {string} key - API key
   * @param {boolean} activeOnly - Get only active overrides
   * @returns {Promise<Object>} List of overrides
   */
  async getRateLimitOverrides(key, activeOnly = false) {
    const queryParam = activeOnly ? '?active=true' : '';
    return await this._request('GET', `/api/keys/${key}/override${queryParam}`);
  }
  
  /**
   * Remove a rate limit override
   * @param {string} key - API key
   * @param {string} overrideId - ID of the override to remove
   * @returns {Promise<Object>} Removal result
   */
  async removeRateLimitOverride(key, overrideId) {
    return await this._request('DELETE', `/api/keys/${key}/override/${overrideId}`);
  }
  
  // Analytics Methods
  
  /**
   * Get overall usage statistics
   * @param {Object} options - Query options
   * @param {string} options.start - Start date ISO string
   * @param {string} options.end - End date ISO string
   * @returns {Promise<Object>} Overall usage statistics
   */
  async getOverallUsage(options = {}) {
    const queryParams = new URLSearchParams();
    if (options.start) queryParams.append('start', options.start);
    if (options.end) queryParams.append('end', options.end);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await this._request('GET', `/api/analytics/overall${queryString}`);
  }
  
  /**
   * Get usage history with time-based aggregation
   * @param {Object} options - Query options
   * @param {string} options.start - Start date ISO string
   * @param {string} options.end - End date ISO string
   * @param {string} options.groupBy - Aggregation level (hour, day, week, month)
   * @param {string} options.apiKey - Filter by API key
   * @returns {Promise<Object>} Usage history data
   */
  async getUsageHistory(options = {}) {
    const queryParams = new URLSearchParams();
    if (options.start) queryParams.append('start', options.start);
    if (options.end) queryParams.append('end', options.end);
    if (options.groupBy) queryParams.append('groupBy', options.groupBy);
    if (options.apiKey) queryParams.append('apiKey', options.apiKey);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await this._request('GET', `/api/analytics/history${queryString}`);
  }
  
  /**
   * Get endpoint-specific analytics
   * @param {Object} options - Query options
   * @param {string} options.start - Start date ISO string
   * @param {string} options.end - End date ISO string
   * @param {string} options.apiKey - Filter by API key
   * @param {number} options.limit - Number of results to return
   * @param {string} options.sort - Sort by field (popularity, traffic, errors)
   * @returns {Promise<Object>} Endpoint analytics data
   */
  async getEndpointAnalytics(options = {}) {
    const queryParams = new URLSearchParams();
    if (options.start) queryParams.append('start', options.start);
    if (options.end) queryParams.append('end', options.end);
    if (options.apiKey) queryParams.append('apiKey', options.apiKey);
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.sort) queryParams.append('sort', options.sort);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await this._request('GET', `/api/analytics/endpoints${queryString}`);
  }
  
  /**
   * Get client usage statistics (admin only)
   * @param {Object} options - Query options
   * @param {string} options.start - Start date ISO string
   * @param {string} options.end - End date ISO string
   * @param {number} options.limit - Number of results to return
   * @param {string} options.sort - Sort by field (requests, limit_hits, activity)
   * @returns {Promise<Object>} Client usage statistics
   */
  async getClientUsage(options = {}) {
    const queryParams = new URLSearchParams();
    if (options.start) queryParams.append('start', options.start);
    if (options.end) queryParams.append('end', options.end);
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.sort) queryParams.append('sort', options.sort);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await this._request('GET', `/api/analytics/clients${queryString}`);
  }
  
  /**
   * Get detailed request logs (admin only)
   * @param {Object} options - Query options
   * @param {string} options.start - Start date ISO string
   * @param {string} options.end - End date ISO string
   * @param {string} options.apiKey - Filter by API key
   * @param {string} options.path - Filter by path
   * @param {string} options.method - Filter by HTTP method
   * @param {string} options.status - Filter by status (success, limited, error)
   * @param {number} options.page - Page number
   * @param {number} options.limit - Results per page
   * @returns {Promise<Object>} Request logs
   */
  async getRequestLogs(options = {}) {
    const queryParams = new URLSearchParams();
    if (options.start) queryParams.append('start', options.start);
    if (options.end) queryParams.append('end', options.end);
    if (options.apiKey) queryParams.append('apiKey', options.apiKey);
    if (options.path) queryParams.append('path', options.path);
    if (options.method) queryParams.append('method', options.method);
    if (options.status) queryParams.append('status', options.status);
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.limit) queryParams.append('limit', options.limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await this._request('GET', `/api/analytics/logs${queryString}`);
  }
  
  /**
   * Export analytics data (admin only)
   * @param {Object} options - Export options
   * @param {string} options.start - Start date ISO string
   * @param {string} options.end - End date ISO string
   * @param {string} options.format - Export format (csv, json)
   * @param {string} options.type - Data type (overall, history, endpoints, clients, logs)
   * @returns {Promise<Object|string>} Exported data
   */
  async exportAnalytics(options = {}) {
    const queryParams = new URLSearchParams();
    if (options.start) queryParams.append('start', options.start);
    if (options.end) queryParams.append('end', options.end);
    if (options.format) queryParams.append('format', options.format);
    if (options.type) queryParams.append('type', options.type);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await this._request('GET', `/api/analytics/export${queryString}`);
  }
  
  /**
   * Create Express middleware for rate limiting
   * @param {Object} options - Middleware options
   * @param {string} options.path - The path to track (defaults to req.path)
   * @param {string} options.keyHeader - Header containing the client's API key (default: X-API-Key)
   * @returns {Function} Express middleware
   */
  middleware(options = {}) {
    const keyHeader = options.keyHeader || 'X-API-Key';
    
    return async (req, res, next) => {
      try {
        // Get API key from header
        const clientApiKey = req.headers[keyHeader.toLowerCase()] || '';
        
        if (!clientApiKey) {
          return res.status(401).json({
            success: false,
            message: 'API key is required'
          });
        }
        
        // Track the current path and method
        const path = options.path || req.path;
        const method = req.method;
        
        // Make a request to the rate limiter service using our API key
        const checkUrl = `${this.serviceUrl}/api/check-rate`;
        
        const response = await fetch(checkUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          },
          body: JSON.stringify({
            clientKey: clientApiKey,
            path,
            method
          }),
          timeout: this.timeout
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          return res.status(response.status).json(data);
        }
        
        // Add rate limit headers to the response
        res.setHeader('X-RateLimit-Limit', data.limit);
        res.setHeader('X-RateLimit-Remaining', data.remaining);
        res.setHeader('X-RateLimit-Reset', data.resetAt);
        
        if (data.status === 'EXCEEDED') {
          return res.status(429).json({
            success: false,
            message: 'Rate limit exceeded. Try again later.',
            retryAfter: data.retryAfter
          });
        }
        
        // If rate limit not exceeded, proceed to the next middleware
        next();
      } catch (error) {
        console.error('Rate limiter middleware error:', error);
        
        // In case of error, allow the request to pass through
        // This prevents the rate limiter from blocking legitimate traffic if it fails
        next();
      }
    };
  }
}

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RateLimiterClient;
}

// Export for ES modules
if (typeof exports !== 'undefined') {
  exports.RateLimiterClient = RateLimiterClient;
}
