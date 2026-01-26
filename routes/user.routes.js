const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth');

// API: GET /api/users/search?email=abc@gmail.com
router.get('/search', authMiddleware.verifyToken, userController.search);

// API: GET /api/users/profile
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);

module.exports = router;