import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route. Please login.' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      if (!req.user.active) {
        return res.status(403).json({ 
          success: false, 
          message: 'Account has been deactivated' 
        });
      }

      if (req.user.isLocked()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Account is temporarily locked. Please try again later.' 
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token. Please login again.' 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

// Check for specific permissions
export const checkPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Admin has all permissions
    if (req.user.role === 'Admin') {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permissions.join(' or ')}`,
        requiredPermissions: permissions,
        userPermissions: userPermissions
      });
    }

    next();
  };
};

// Verify ownership or admin
export const verifyOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Admin can access everything
    if (req.user.role === 'Admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField];
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own resources.',
      });
    }

    next();
  };
};

// Rate limiting by role
export const roleBasedRateLimit = () => {
  const limits = {
    User: 100,    // 100 requests per hour
    Agent: 500,   // 500 requests per hour
    Admin: 10000  // 10000 requests per hour
  };

  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour

    if (!requests.has(userId)) {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);
    const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    
    const limit = limits[req.user.role] || limits.User;

    if (recentRequests.length >= limit) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        limit,
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }

    recentRequests.push(now);
    requests.set(userId, recentRequests);
    next();
  };
};
