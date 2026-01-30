const jwt = require('jsonwebtoken');

// 1. Middleware to verify the Token (Authentication)
const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded; // Contains id and role
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// 2. Middleware to verify the Role (Authorization)
const authorize = (...roles) => {
  return (req, res, next) => {
    // If the role saved in the JWT token is not in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Exporting both as an object
module.exports = { auth, authorize };