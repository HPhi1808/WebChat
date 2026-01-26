const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { verifyToken } = require('../middlewares/auth');

router.post('/', verifyToken, uploadController.uploadFile);

module.exports = router;