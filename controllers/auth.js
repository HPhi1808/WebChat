const { Resend } = require('resend');
require('dotenv').config();

const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getOtpEmailTemplate } = require('../utils/emailTemplates');

const resend = new Resend(process.env.RESEND_API_KEY);

// --- ĐĂNG KÝ (Mặc định là User) ---
exports.register = async (req, res) => {
    const { email, password, full_name, gender, dob } = req.body;

    try {
        // 1. Kiểm tra xem email đã có trong hệ thống chưa
        const { data: users } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        const existingUser = users && users.length > 0 ? users[0] : null;

        // 2. Logic xử lý trùng lặp
        if (existingUser) {
            // TRƯỜNG HỢP 1: Đã xác thực rồi -> Chặn luôn
            if (existingUser.is_verified) {
                return res.status(400).json({ message: 'Email này đã được đăng ký và kích hoạt. Vui lòng đăng nhập.' });
            }

            // TRƯỜNG HỢP 2: Chưa xác thực (User bị kẹt) -> Cho phép ghi đè thông tin mới
            console.log(`Email ${email} tồn tại nhưng chưa verify. Tiến hành gửi lại OTP.`);
        }

        // 3. Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Thực hiện Insert hoặc Update
        if (!existingUser) {
            // --- A. NGƯỜI DÙNG MỚI HOÀN TOÀN ---
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    email,
                    password_hash: hashedPassword,
                    full_name,
                    gender,
                    dob,
                    role: 'user',
                    is_verified: false
                }]);

            if (insertError) throw insertError;

        } else {
            // --- B. NGƯỜI DÙNG CŨ CHƯA VERIFY (Ghi đè thông tin) ---
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    password_hash: hashedPassword,
                    full_name,
                    gender,
                    dob,
                    updated_at: new Date()
                })
                .eq('email', email);

            if (updateError) throw updateError;
        }

        // 5. TẠO OTP & GỬI MAIL

        await supabase.from('otp_codes').delete().eq('email', email);

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();

        // Lưu OTP mới
        await supabase.from('otp_codes').insert([{ email, code: otpCode, expires_at: expiresAt }]);

        // Gửi email
        const htmlContent = getOtpEmailTemplate(full_name, otpCode);
        const { data, error } = await resend.emails.send({
            from: `Hệ thống Chat Web <${process.env.EMAIL_SENDER}>`,
            to: email,
            subject: `Mã xác thực của bạn là ${otpCode}`,
            html: htmlContent
        });

        if (error) {
            console.error("Lỗi gửi mail:", error);
            return res.status(201).json({
                message: 'Đăng ký thành công nhưng gửi mail thất bại. Hãy thử lại sau.',
                warning: true
            });
        }

        res.status(201).json({ message: 'Mã OTP đã được gửi! Vui lòng kiểm tra email.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// 2. XÁC THỰC OTP
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Lấy OTP mới nhất của email đó
        const { data: otps, error } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('email', email)
            .eq('code', otp)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error || otps.length === 0) {
            return res.status(400).json({ message: 'Mã OTP không đúng!' });
        }

        const otpRecord = otps[0];

        // Check hết hạn
        if (new Date(otpRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Mã OTP đã hết hạn!' });
        }

        // OTP đúng -> Kích hoạt User
        await supabase.from('users').update({ is_verified: true }).eq('email', email);

        // Xóa OTP đã dùng (dọn dẹp)
        await supabase.from('otp_codes').delete().eq('email', email);

        res.json({ message: 'Xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- ĐĂNG NHẬP DÀNH CHO USER ---
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: users, error } = await supabase.from('users').select('*').eq('email', email);
        if (error || users.length === 0) return res.status(404).json({ message: 'Email không tồn tại' });

        const user = users[0];

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Đây là cổng đăng nhập cho User. Admin vui lòng sang trang quản trị.' });
        }

        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) return res.status(400).json({ message: 'Sai mật khẩu' });

        const token = jwt.sign({ id: user.id, role: user.role, full_name: user.full_name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: user.id, full_name: user.full_name, role: user.role } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- ĐĂNG NHẬP DÀNH CHO ADMIN ---
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: users, error } = await supabase.from('users').select('*').eq('email', email);
        if (error || users.length === 0) return res.status(404).json({ message: 'Tài khoản không tồn tại' });

        const user = users[0];

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập trang Admin.' });
        }

        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) return res.status(400).json({ message: 'Sai mật khẩu' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, message: "Chào mừng quản trị viên!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};