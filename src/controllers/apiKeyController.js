const apiKeyService = require('../services/apiKeyService');

/**
 * Controller for API key related operations
 */
class ApiKeyController {
  /**
   * Create a new API key
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createApiKey(req, res, next) {
    try {
      const { name, rateLimit, expiresIn } = req.body;
      const apiKey = await apiKeyService.createApiKey({ name, rateLimit, expiresIn });
      
      res.status(201).json({
        success: true,
        message: 'API key created successfully',
        data: apiKey
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate an API key
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async validateApiKey(req, res, next) {
    try {
      const { key } = req.body;
      const isValid = await apiKeyService.validateApiKey(key);
      
      res.json({
        success: true,
        data: { isValid }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get API key details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getApiKeyDetails(req, res, next) {
    try {
      const { key } = req.params;
      const keyDetails = await apiKeyService.getApiKeyDetails(key);
      
      res.json({
        success: true,
        data: keyDetails
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get rate limit statistics for a specific API key
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getRateLimitStats(req, res, next) {
    try {
      const { key } = req.params;
      const { path, method } = req.query;
      
      const stats = await apiKeyService.getRateLimitStats(key, path, method);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update API key settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateApiKey(req, res, next) {
    try {
      const { key } = req.params;
      const updateData = req.body;
      
      const updated = await apiKeyService.updateApiKey(key, updateData);
      
      res.json({
        success: true,
        message: 'API key updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an API key
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteApiKey(req, res, next) {
    try {
      const { key } = req.params;
      await apiKeyService.deleteApiKey(key);
      
      res.json({
        success: true,
        message: 'API key deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a rate limit override for an API key
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createRateLimitOverride(req, res, next) {
    try {
      const { key } = req.params;
      const { 
        rateLimit, 
        path, 
        method, 
        duration,
        reason 
      } = req.body;
      
      const override = await apiKeyService.createRateLimitOverride(key, {
        rateLimit,
        path,
        method,
        duration, // duration in seconds for the override
        reason, // optional reason for the override
        createdBy: req.user.userId // track who created the override
      });
      
      res.status(201).json({
        success: true,
        message: 'Rate limit override created successfully',
        data: override
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all rate limit overrides for an API key
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getRateLimitOverrides(req, res, next) {
    try {
      const { key } = req.params;
      const { active } = req.query; // Optional filter for active overrides only
      
      const overrides = await apiKeyService.getRateLimitOverrides(key, active === 'true');
      
      res.json({
        success: true,
        data: overrides
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a rate limit override for an API key
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async removeRateLimitOverride(req, res, next) {
    try {
      const { key, overrideId } = req.params;
      
      await apiKeyService.removeRateLimitOverride(key, overrideId);
      
      res.json({
        success: true,
        message: 'Rate limit override removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApiKeyController();