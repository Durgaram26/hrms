const { RolePermission, Permission } = require('../models');

/**
 * Middleware to check if user has required permission
 * @param {string} requiredPermission - Permission name required for the route
 * @returns {function} Express middleware function
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Get user role from authenticated request
      const { role } = req.user;
      
      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No role assigned'
        });
      }
      
      // Admin role has all permissions
      if (role === 'admin') {
        return next();
      }
      
      // Find the permission ID for the required permission
      const permission = await Permission.findOne({
        where: { name: requiredPermission }
      });
      
      if (!permission) {
        return res.status(500).json({
          success: false,
          message: 'Permission not defined in system'
        });
      }
      
      // Check if the user's role has the required permission
      const rolePermission = await RolePermission.findOne({
        where: {
          role: role,
          permissionId: permission.id
        }
      });
      
      if (!rolePermission) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions'
        });
      }
      
      // User has permission, proceed to the next middleware/route handler
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error.message
      });
    }
  };
};

module.exports = {
  checkPermission
};