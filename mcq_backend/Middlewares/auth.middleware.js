const jwt = require('jsonwebtoken');
const Student = require('../models/student.model');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    if (decoded.role !== "student") {
      return res.status(403).json({ error: 'Access denied. Not authorized as student.' });
    }
    const student = await Student.findById(decoded.id);
    if (student && student.activeSession !== token) {
      return res.status(401).json({ message: 'Session invalid, please log in again' });
    }

    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = { authMiddleware };
