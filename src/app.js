const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const apiKeyRoutes = require('./routes/apiKeyRoutes');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const { initRedis } = require('./config/redis');

// Initialize Express app
const app = express();

// Initialize Redis
initRedis();

// Apply security middleware
app.use(helmet());
app.use(cors());

// Request logging
app.use(morgan('dev'));

// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public endpoints (not rate limited)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Auth routes (public)
app.use('/api/auth', rateLimiter({
  limit: 10,
  windowSec: 300 // 5 minutes
}), authRoutes);

// API key management routes (protected)
app.use('/api/keys', rateLimiter({
  limit: 20,
  windowSec: 360
}), apiKeyRoutes);

// Analytics routes (protected)
app.use('/api/analytics', rateLimiter({
  limit: 30,
  windowSec: 300 // 5 minutes
}), analyticsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;