const jwt = require('jsonwebtoken');

// 1. Check xem có đăng nhập chưa
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Không tìm thấy token xác thực' });

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded; // Lưu info user vào biến req để dùng sau
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

// 2. Chỉ cho phép Admin
exports.requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Truy cập bị từ chối! Bạn không phải Admin.' });
    }
    next();
};

// 3. Chỉ cho phép User
exports.requireUser = (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ message: 'Truy cập bị từ chối! Bạn không phải User.' });
    }
    next();
};