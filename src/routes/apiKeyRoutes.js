const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Create a new API key
router.post('/', apiKeyController.createApiKey);

// Validate an API key
router.post('/validate', apiKeyController.validateApiKey);

// Get specific API key details
router.get('/:key', apiKeyController.getApiKeyDetails);

// Get rate limit statistics for a specific API key
router.get('/:key/stats', apiKeyController.getRateLimitStats);

// Rate limit override endpoints
router.post('/:key/override', apiKeyController.createRateLimitOverride);
router.get('/:key/override', apiKeyController.getRateLimitOverrides);
router.delete('/:key/override/:overrideId', apiKeyController.removeRateLimitOverride);

// Update API key settings
router.put('/:key', apiKeyController.updateApiKey);

// Delete an API key - restricted to admins
router.delete('/:key', roleCheck(['admin']), apiKeyController.deleteApiKey);

module.exports = router;