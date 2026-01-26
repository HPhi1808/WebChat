💬 Chat Web Realtime (Node.js + Socket.io)
📌 Giới thiệu
Dự án Chat Web Realtime là một ứng dụng chat thời gian thực xây dựng theo mô hình Client – Server, sử dụng Node.js + Express + Socket.io. Ứng dụng hỗ trợ đăng ký tài khoản, xác thực email bằng OTP, đăng nhập, và chat realtime giữa các người dùng.
Dự án phù hợp cho mục đích đồ án môn Lập trình mạng / Ứng dụng mạng thời gian thực.

🧱 Công nghệ sử dụng
Backend
Node.js
Express.js
Socket.io (Realtime)
JWT (Authentication)
bcrypt (Hash mật khẩu)
Supabase (PostgreSQL)
Resend / Email Service (Gửi OTP)
Frontend
HTML5
CSS3
JavaScript (Vanilla)
Bootstrap 5

📁 Cấu trúc thư mục
project-root/
│
├── config/          # Cấu hình hệ thống (DB, mail, JWT)
├── controllers/    # Xử lý request / response
├── middlewares/    # Middleware xác thực, bảo mật
├── public/
│   └── user/        # Giao diện client (HTML)
│       ├── login.html
│       ├── register.html
│       └── home.html
├── repositories/   # Làm việc trực tiếp với database
├── routes/         # Định tuyến API
├── services/       # Xử lý nghiệp vụ (auth, OTP, chat)
├── sockets/        # Xử lý Socket.io realtime
├── utils/          # Hàm dùng chung (OTP, email template)
├── .env.example    # Mẫu biến môi trường
├── package.json
└── server.js       # File khởi động server

🔄 Luồng hoạt động chính
1️⃣ Đăng ký tài khoản
Người dùng nhập thông tin đăng ký
Server lưu tài khoản ở trạng thái chưa xác thực
Gửi mã OTP qua email
2️⃣ Xác thực OTP
Người dùng nhập OTP
Server kiểm tra OTP và kích hoạt tài khoản
3️⃣ Đăng nhập
Người dùng đăng nhập bằng email và mật khẩu
Server trả về JWT Token
4️⃣ Chat realtime
Client kết nối Socket.io sau khi đăng nhập
Gửi / nhận tin nhắn realtime

⚙️ Cài đặt & chạy project
1️⃣ Clone project
git clone https://github.com/HPhi1808/WebChat.git
2️⃣ Cài đặt thư viện
npm install
3️⃣ Tạo file môi trường
cp .env.example .env
Điền các giá trị cần thiết trong file .env
4️⃣ Chạy server
npm start
Server mặc định chạy tại:
http://localhost:PORT

🔐 Bảo mật
Mật khẩu được hash bằng bcrypt
Xác thực bằng JWT
OTP có thời hạn
Các API bảo vệ bằng middleware
