const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); 
const admin_auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Not authorized as admin.' });
    }

    const admin = await Admin.findById(decoded.id);
    if (admin && admin.activeSession && admin.activeSession !== token) {
      return res.status(401).json({ message: 'Session invalid. Please log in again.' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports =  admin_auth ;
