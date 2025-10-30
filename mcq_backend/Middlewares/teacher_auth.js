const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); 
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded token:", decoded);
    if (decoded.role !== "teacher") {
      return res.status(403).json({ error: 'Access denied. Not authorized as teacher.' });
    }
    req.teacherId = decoded.id;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' }); 
  }
};

