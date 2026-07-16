const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Rate Limit Usage Schema
 * Tracks API request history for enforcing rate limits
 */
const rateLimitUsageSchema = new Schema({
  apiKey: {
    type: String,
    required: true,
    index: true
  },
  endpoint: {
    path: String,
    method: String
  },
  // Using TTL index to automatically expire old records
  timestamp: {
    type: Date,
    default: Date.now,
    expires: '1d' // Automatically delete records older than 1 day
  },
  responseStatus: {
    type: Number
  },
  responseTime: {
    type: Number // in ms
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});

// Compound index for efficient querying of requests by api key and time range
rateLimitUsageSchema.index({ apiKey: 1, timestamp: 1 });
// Index for querying by endpoint
rateLimitUsageSchema.index({ apiKey: 1, 'endpoint.path': 1, 'endpoint.method': 1, timestamp: 1 });

/**
 * Static method to get request count for a specific API key within a time window
 * @param {String} apiKey - The API key
 * @param {String} path - Optional path to filter by
 * @param {String} method - Optional HTTP method to filter by
 * @param {Number} windowMs - Time window in milliseconds
 * @returns {Promise<Number>} Number of requests in time window
 */
rateLimitUsageSchema.statics.getRequestCountInWindow = async function(apiKey, path, method, windowMs) {
  const since = new Date(Date.now() - windowMs);
  
  const query = { apiKey, timestamp: { $gte: since } };
  
  if (path) {
    query['endpoint.path'] = path;
  }
  
  if (method) {
    query['endpoint.method'] = method;
  }
  
  return this.countDocuments(query);
};

/**
 * Get timestamps of all requests for a specific API key within a time window
 * @param {String} apiKey - The API key
 * @param {String} path - Optional path to filter by
 * @param {String} method - Optional HTTP method to filter by
 * @param {Number} windowMs - Time window in milliseconds
 * @returns {Promise<Array>} Array of request timestamps
 */
rateLimitUsageSchema.statics.getRequestTimestamps = async function(apiKey, path, method, windowMs) {
  const since = new Date(Date.now() - windowMs);
  
  const query = { apiKey, timestamp: { $gte: since } };
  
  if (path) {
    query['endpoint.path'] = path;
  }
  
  if (method) {
    query['endpoint.method'] = method;
  }
  
  const records = await this.find(query, { timestamp: 1, _id: 0 })
    .sort({ timestamp: 1 })
    .lean();
    
  return records.map(record => record.timestamp);
};

module.exports = mongoose.model('RateLimitUsage', rateLimitUsageSchema);