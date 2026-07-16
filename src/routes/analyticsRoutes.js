const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get overall usage statistics
router.get('/overall', analyticsController.getOverallUsage);

// Get usage history with time-based aggregation
router.get('/history', analyticsController.getUsageHistory);

// Get endpoint-specific analytics
router.get('/endpoints', analyticsController.getEndpointAnalytics);

// Get per-client usage statistics (admin only)
router.get('/clients', roleCheck(['admin']), analyticsController.getClientUsage);

// Get detailed request logs (admin only)
router.get('/logs', roleCheck(['admin']), analyticsController.getRequestLogs);

// Export analytics data (admin only)
router.get('/export', roleCheck(['admin']), analyticsController.exportAnalytics);

module.exports = router;
