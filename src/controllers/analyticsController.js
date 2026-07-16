const analyticsService = require('../services/analyticsService');

/**
 * Controller for analytics and usage statistics operations
 */
class AnalyticsController {
  /**
   * Get overall usage statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getOverallUsage(req, res, next) {
    try {
      const { start, end } = req.query;
      
      const statistics = await analyticsService.getOverallUsage({
        userId: req.user.userId,
        startDate: start ? new Date(start) : null,
        endDate: end ? new Date(end) : null
      });
      
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get usage history with time-based aggregation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUsageHistory(req, res, next) {
    try {
      const { 
        start, 
        end, 
        groupBy, // hour, day, week, month
        apiKey 
      } = req.query;
      
      const history = await analyticsService.getUsageHistory({
        userId: req.user.userId,
        apiKey,
        startDate: start ? new Date(start) : null,
        endDate: end ? new Date(end) : null,
        groupBy: groupBy || 'day'
      });
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get endpoint-specific analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getEndpointAnalytics(req, res, next) {
    try {
      const { 
        start, 
        end, 
        apiKey,
        limit,
        sort // popularity, traffic, errors
      } = req.query;
      
      const endpoints = await analyticsService.getEndpointAnalytics({
        userId: req.user.userId,
        apiKey,
        startDate: start ? new Date(start) : null,
        endDate: end ? new Date(end) : null,
        limit: limit ? parseInt(limit) : 10,
        sort: sort || 'popularity'
      });
      
      res.json({
        success: true,
        data: endpoints
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get per-client usage statistics (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getClientUsage(req, res, next) {
    try {
      const { 
        start, 
        end, 
        limit,
        sort // requests, limit_hits, activity
      } = req.query;
      
      const clientStats = await analyticsService.getClientUsage({
        startDate: start ? new Date(start) : null,
        endDate: end ? new Date(end) : null,
        limit: limit ? parseInt(limit) : 10,
        sort: sort || 'requests'
      });
      
      res.json({
        success: true,
        data: clientStats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detailed request logs (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getRequestLogs(req, res, next) {
    try {
      const { 
        start, 
        end, a
        piKey,
        path,
        method,
        status, // success, limited, error
        page,
        limit
      } = req.query;
      
      const logs = await analyticsService.getRequestLogs({
        apiKey,
        path,
        method,
        status,
        startDate: start ? new Date(start) : null,
        endDate: end ? new Date(end) : null,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20
      });
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export analytics data (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async exportAnalytics(req, res, next) {
    try {
      const { 
        start, 
        end, 
        format, // csv, json
        type // overall, history, endpoints, clients, logs
      } = req.query;
      
      const exportData = await analyticsService.exportAnalytics({
        startDate: start ? new Date(start) : null,
        endDate: end ? new Date(end) : null,
        format: format || 'csv',
        type: type || 'overall'
      });
      
      if (format === 'json') {
        return res.json({
          success: true,
          data: exportData
        });
      }
      
      // For CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="rate-limiter-${type}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(exportData);
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
