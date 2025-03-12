const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Check for token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (decodedToken.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Add user data to request
    req.user = {
      id: decodedToken.userId,
      email: decodedToken.email,
      role: decodedToken.role
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};