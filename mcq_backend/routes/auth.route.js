const express = require('express');
const router = express.Router();
const authController = require('../Controllers/auth.controller');
const { authMiddleware } = require('../Middlewares/auth.middleware');


router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout); 
router.post('/send-otp', authController.sendOTP);
router.post('/verifyAndSignUp', authController.verifyAndSignUp);


module.exports = router;
