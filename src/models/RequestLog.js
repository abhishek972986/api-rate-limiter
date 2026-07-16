const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Request Log Schema
 * Stores detailed logs of rate-limited API requests
 */
const requestLogSchema = new Schema({
  apiKey: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  clientIp: {
    type: String
  },
  path: {
    type: String,
    required: true,
    index: true
  },
  method: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'limited', 'error'],
    required: true,
    index: true
  },
  responseTime: {
    type: Number, // in milliseconds
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  headers: {
    type: Map,
    of: String
  },
  queryParams: {
    type: Map,
    of: String
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Create compound indexes for common queries
requestLogSchema.index({ apiKey: 1, timestamp: -1 });
requestLogSchema.index({ userId: 1, timestamp: -1 });
requestLogSchema.index({ path: 1, method: 1, timestamp: -1 });

module.exports = mongoose.model('RequestLog', requestLogSchema);
