const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Rate Limit Override Schema
 * Stores temporary rate limit overrides for API keys
 */
const rateLimitOverrideSchema = new Schema({
  apiKey: {
    type: String,
    required: true,
    ref: 'ApiKey',
    index: true
  },
  rateLimit: {
    type: Number,
    required: true,
    min: 1
  },
  path: {
    type: String,
    default: '*' // '*' means all paths
  },
  method: {
    type: String,
    default: '*' // '*' means all methods
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    comment: 'Duration in seconds'
  },
  reason: {
    type: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster querying of active overrides
rateLimitOverrideSchema.index({ apiKey: 1, endTime: 1, isActive: 1 });

// Virtual for checking if override is still valid
rateLimitOverrideSchema.virtual('isValid').get(function() {
  return this.isActive && this.endTime > new Date();
});

module.exports = mongoose.model('RateLimitOverride', rateLimitOverrideSchema);
