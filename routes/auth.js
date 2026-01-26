const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Route Đăng ký
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);

// Route Đăng nhập
router.post('/login/user', authController.loginUser);

module.exports = router;