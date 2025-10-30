const express = require('express');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_NAME ||'admin';

const createAdminIfNotExists = async (req, res, next) => {
  const adminExists = await Admin.findOne({ username: ADMIN_USERNAME });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await new Admin({ username: ADMIN_USERNAME, password: hashedPassword }).save();
  }
  next();
};

router.use(createAdminIfNotExists);

router.put('/change-password', async (req, res) => {
  const { newPassword } = req.body;

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await Admin.updateOne({ username: ADMIN_USERNAME }, { password: hashedPassword });

  res.json({ message: 'Password changed successfully' });
});

module.exports = router;
