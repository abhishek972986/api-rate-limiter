/**
 * Role-based authorization middleware
 * @param {string[]} allowedRoles - Array of roles allowed to access the resource
 * @returns {Function} Express middleware
 */
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    // User must be authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions'
      });
    }

    next();
  };
};

module.exports = roleCheck;
