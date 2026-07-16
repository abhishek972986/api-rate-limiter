const mongoose = require('mongoose');
const { Schema } = mongoose;
const crypto = require('crypto');

/**
 * Rate Limit Configuration Schema
 * Defines rate limiting rules for an API key
 */
const rateLimitConfigSchema = new Schema({
  // Requests per time window
  limit: {
    type: Number,
    required: true,
    min: 1,
    default: 100
  },
  // Time window in seconds (e.g., 60 for per minute, 3600 for hourly)
  window: {
    type: Number,
    required: true,
    min: 1,
    default: 60
  },
  // Optional specific endpoints to apply this limit to
  endpoints: [{
    path: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ALL'],
      default: 'ALL'
    }
  }]
}, { _id: false });

/**
 * API Key Schema
 * Stores API key information and associated rate limit configurations
 */
const apiKeySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Default rate limit configuration applied to all endpoints
  defaultRateLimit: {
    type: rateLimitConfigSchema,
    required: true,
    default: {
      limit: 100,
      window: 60
    }
  },
  // Custom rate limits for specific endpoints or services
  customRateLimits: [rateLimitConfigSchema],
  // Usage statistics
  usage: {
    totalRequests: {
      type: Number,
      default: 0
    },
    lastRequest: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default 1 year expiry
  }
}, {
  timestamps: true
});

/**
 * Generate a new API key
 * @returns {String} A random API key
 */
apiKeySchema.statics.generateKey = function() {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Check if an API key has expired
 * @returns {Boolean} True if expired, false otherwise
 */
apiKeySchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

/**
 * Check if the rate limit has been exceeded for a specific endpoint
 * @param {String} path - The API endpoint path
 * @param {String} method - The HTTP method
 * @param {Array} requestHistory - Array of timestamp records for requests
 * @returns {Object} Object with exceeded (boolean) and limit info
 */
apiKeySchema.methods.isRateLimitExceeded = function(path, method, requestHistory) {
  // Find matching custom rate limit or use default
  const customLimit = this.customRateLimits.find(limit => 
    limit.endpoints.some(endpoint => 
      endpoint.path === path && (endpoint.method === method || endpoint.method === 'ALL')
    )
  );
  
  const rateLimit = customLimit || this.defaultRateLimit;
  const { limit, window } = rateLimit;
  
  // Filter request history to only include requests within the time window
  const windowStartTime = Date.now() - (window * 1000);
  const requestsInWindow = requestHistory.filter(timestamp => timestamp >= windowStartTime).length;
  
  return {
    exceeded: requestsInWindow >= limit,
    limit,
    window,
    remaining: Math.max(0, limit - requestsInWindow),
    reset: new Date(windowStartTime + (window * 1000))
  };
};

module.exports = mongoose.model('ApiKey', apiKeySchema);