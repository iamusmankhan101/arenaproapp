const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Protect routes - User authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('+refreshToken');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token is invalid. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
};

// Admin authentication
exports.adminProtect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No admin token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    // Get admin from token
    const admin = await Admin.findById(decoded.id).select('+refreshToken');
    
    if (!admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Token is invalid. Admin not found.'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Admin account is deactivated.'
      });
    }

    if (admin.isLocked) {
      return res.status(401).json({
        status: 'error',
        message: 'Admin account is temporarily locked.'
      });
    }

    // Add admin to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid admin token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Admin token expired'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Admin authentication error'
    });
  }
};

// Check admin permissions
exports.adminPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Admin authentication required'
      });
    }

    if (!req.admin.hasPermission(permission)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Required permission: ${permission}`
      });
    }

    next();
  };
};

// Optional authentication (for public routes that can benefit from user context)
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Generate JWT token
exports.generateToken = (id, secret, expiresIn) => {
  return jwt.sign({ id }, secret, { expiresIn });
};

// Generate user tokens
exports.generateUserTokens = (userId) => {
  const accessToken = exports.generateToken(userId, process.env.JWT_SECRET, process.env.JWT_EXPIRE);
  const refreshToken = exports.generateToken(userId, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRE);
  
  return { accessToken, refreshToken };
};

// Generate admin tokens
exports.generateAdminTokens = (adminId) => {
  const accessToken = exports.generateToken(adminId, process.env.ADMIN_JWT_SECRET, process.env.ADMIN_JWT_EXPIRE);
  const refreshToken = exports.generateToken(adminId, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRE);
  
  return { accessToken, refreshToken };
};