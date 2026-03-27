import jwt from 'jsonwebtoken';

// 1. Exporting 'auth' directly
export const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// 2. Exporting 'authorize' directly
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (set by auth middleware) and has the right role
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role ${req.user?.role || 'unknown'} is not authorized to access this route` 
      });
    }
    next();
  };
};

// 3. Exporting facultyAuth if you still want to use it as a shorthand
export const facultyAuth = (req, res, next) => {
    return authorize('faculty')(req, res, next);
};