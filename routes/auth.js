const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Route Đăng ký
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);

// Route Đăng nhập riêng biệt
router.post('/login/user', authController.loginUser);
router.post('/login/admin', authController.loginAdmin);

module.exports = router;