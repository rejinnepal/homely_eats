const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware:', {
      hasToken: !!token,
      tokenLength: token?.length,
      headers: req.headers
    });
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token decoded:', {
      userId: decoded.userId,
      exp: decoded.exp
    });

    const user = await User.findById(decoded.userId);
    console.log('User found:', {
      found: !!user,
      userId: user?._id,
      roles: user?.roles,
      activeRole: user?.activeRole
    });

    if (!user) {
      console.log('User not found after token decode');
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', {
      error: error.message,
      stack: error.stack
    });
    res.status(401).json({ message: 'Please authenticate', error: error.message });
  }
};

// Middleware to check if user has a specific role
const hasRole = (role) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!req.user.hasRole(role)) {
        return res.status(403).json({ message: 'Access denied. Required role: ' + role });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking role', error: error.message });
    }
  };
};

// Middleware to check if user has any of the specified roles
const hasAnyRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const hasRequiredRole = roles.some(role => req.user.hasRole(role));
      if (!hasRequiredRole) {
        return res.status(403).json({ message: 'Access denied. Required roles: ' + roles.join(', ') });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking roles', error: error.message });
    }
  };
};

// Middleware to check if user is a host
const isHost = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.activeRole !== 'host') {
      return res.status(403).json({ message: 'Access denied. Host role required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking host role', error: error.message });
  }
};

module.exports = { auth, hasRole, hasAnyRole, isHost }; 