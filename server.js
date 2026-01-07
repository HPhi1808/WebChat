const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const { verifyToken, requireAdmin, requireUser } = require('./middlewares/auth');
const app = express();

// --- CONFIG APP ---
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(express.static('public'));

const authRoutes = require('./routes/auth');
// User routes
const userHomeRoutes = require('./routes/user/home');
// Admin routes
const adminDashboardRoutes = require('./routes/admin/dashboard');
const adminUsersRoutes = require('./routes/admin/users');
const adminSystemLogsRoutes = require('./routes/admin/system_logs');

// --- ĐỊNH NGHĨA API ---
// 1. Auth
app.use('/api/auth', authRoutes);

// 2. API User
app.use('/api/user/home', verifyToken, requireUser, userHomeRoutes);

// 3. API Admin
const adminMiddleware = [verifyToken, requireAdmin];

app.use('/api/admin/dashboard', adminMiddleware, adminDashboardRoutes);
app.use('/api/admin/users', adminMiddleware, adminUsersRoutes);
app.use('/api/admin/system_logs', adminMiddleware, adminSystemLogsRoutes);


// --- ROUTES FRONTEND ---

// Admin Pages
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});
app.get('/admin/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});
app.get('/admin/users.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'users.html'));
});
app.get('/admin/system_logs.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'system_logs.html'));
});

// User Pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user', 'login.html'));
});

// --- KHỞI CHẠY SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});