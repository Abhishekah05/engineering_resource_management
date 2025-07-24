const jwt = require('jsonwebtoken');
const User = require('../src/models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Manager only middleware
const requireManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Manager access required' });
  }
  next();
};

// Engineer only middleware
const requireEngineer = (req, res, next) => {
  if (req.user.role !== 'engineer') {
    return res.status(403).json({ message: 'Engineer access required' });
  }
  next();
};

module.exports = { auth, requireManager, requireEngineer };