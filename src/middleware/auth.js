const { verifyToken } = require('../utils/jwt');

/**
 * Authentication middleware
 * Verifies JWT token and adds user data to request
 */
const auth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decodedToken = verifyToken(token);
    
    // Add user data to request
    req.user = decodedToken;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = auth;
