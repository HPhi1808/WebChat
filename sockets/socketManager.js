const jwt = require('jsonwebtoken');
const chatHandler = require('./chatHandler');
const userRepository = require('../repositories/user.repository');

// Map lưu trữ: UserID -> Set<SocketID> (Một user có thể có nhiều socket id do mở nhiều tab)
const userSocketMap = new Map(); 

module.exports = (io) => {
    
    // 1. Middleware xác thực Socket
    io.use((socket, next) => {
        const token = socket.handshake.auth.token; 
        if (!token) return next(new Error("Authentication error"));

        jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
            if (err) return next(new Error("Authentication error"));
            socket.user = decoded; 
            next();
        });
    });

    // 2. Xử lý kết nối
    io.on('connection', async (socket) => {
        const userId = socket.user.id;
        const userEmail = socket.user.email;

        // --- XỬ LÝ ONLINE ---
        // Nếu user này chưa có trong Map, tạo mới Set
        if (!userSocketMap.has(userId)) {
            userSocketMap.set(userId, new Set());
        }
        // Thêm socket id hiện tại vào Set
        userSocketMap.get(userId).add(socket.id);

        // Chỉ khi đây là kết nối ĐẦU TIÊN (size === 1) -> Mới tính là Online thật sự
        if (userSocketMap.get(userId).size === 1) {
            // 1. Update DB
            await userRepository.updateUserStatus(userId, true);
            
            // 2. Báo cho toàn hệ thống
            io.emit('user_status_change', { 
                userId: userId, 
                status: 'online',
                last_seen: new Date()
            });
            console.log(`User Online: ${userEmail} (ID: ${userId})`);
        } else {
            console.log(`User opened new tab: ${userEmail}`);
        }

        // --- Gắn các Handler ---
        // Truyền userSocketMap vào để handler biết đường gửi tin
        chatHandler(io, socket, userSocketMap);

        // --- XỬ LÝ NGẮT KẾT NỐI ---
        socket.on('disconnect', async () => {
            // Xóa socket id cụ thể này khỏi Set
            if (userSocketMap.has(userId)) {
                userSocketMap.get(userId).delete(socket.id);

                // Kiểm tra xem user còn tab nào mở không?
                if (userSocketMap.get(userId).size === 0) {
                    // Hết sạch socket -> User đã Offline thật sự
                    userSocketMap.delete(userId);
                    
                    // 1. Update DB thành Offline
                    await userRepository.updateUserStatus(userId, false);

                    // 2. Báo cho toàn hệ thống
                    io.emit('user_status_change', { 
                        userId: userId, 
                        status: 'offline',
                        last_seen: new Date()
                    });
                    
                    console.log(`User Offline: ${userEmail}`);
                }
            }
        });
    });
};