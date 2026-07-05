const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replify-secret-key';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.businessId = decoded.businessId;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
