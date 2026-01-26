const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();

// --- 1. IMPORT ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user.routes');
const chatRoutes = require('./routes/chat.routes');
const uploadRoutes = require('./routes/upload.routes');
const socketManager = require('./sockets/socketManager');
const { verifyToken, requireAdmin, requireUser } = require('./middlewares/auth');

const app = express();
const server = http.createServer(app);

// --- 2. CẤU HÌNH SOCKET.IO ---
const io = new Server(server, {
    cors: {
        origin: [
            "https://chat.uth.asia", 
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ],
        methods: ["GET", "POST"]
    }
});

// Kích hoạt Socket Manager
socketManager(io);

// Middleware gán biến io vào req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- MIDDLEWARE CHẶN TRUY CẬP TỪ DOMAIN RENDER ---
app.use((req, res, next) => {
    const host = req.headers.host; 
    
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        return next();
    }

    if (host === 'chat.uth.asia') {
        return next();
    }
    res.status(404).send('Not Found');
});
// -------------------------------------------------------


// --- 3. CONFIG APP ---
app.use(cors({
    origin: [
        "https://chat.uth.asia", 
        "http://localhost:3000"
    ]
}));

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static('public'));

// --- 4. ĐỊNH NGHĨA API ---

// Auth (Không cần token)
app.use('/api/auth', authRoutes);

// User & Chat (BẮT BUỘC CẦN verifyToken để lấy req.user.id)
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/chats', verifyToken, chatRoutes);
app.use('/api/upload', verifyToken, uploadRoutes);

// --- 5. ROUTES FRONTEND (Trả về HTML) ---
// User Pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'login.html'));
});

// --- 6. KHỞI CHẠY SERVER ---
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server Chat đang chạy tại http://localhost:${PORT}`);
});