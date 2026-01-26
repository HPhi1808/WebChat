# <a name="chat-web-realtime-node.js-socket.io"></a>💬 Chat Web Realtime (Node.js + Socket.io)
## <a name="giới-thiệu"></a>📌 Giới thiệu
Dự án **Chat Web Realtime** là một ứng dụng chat thời gian thực xây dựng theo mô hình **Client – Server**, sử dụng **Node.js + Express + Socket.io**. Ứng dụng hỗ trợ đăng ký tài khoản, xác thực email bằng OTP, đăng nhập, và chat realtime giữa các người dùng.

Dự án phù hợp cho mục đích **đồ án môn Lập trình mạng / Ứng dụng mạng thời gian thực**.

-----
## <a name="công-nghệ-sử-dụng"></a>🧱 Công nghệ sử dụng
### <a name="backend"></a>Backend
- **Node.js**
- **Express.js**
- **Socket.io** (Realtime)
- **JWT** (Authentication)
- **bcrypt** (Hash mật khẩu)
- **Supabase (PostgreSQL)**
- **Resend / Email Service** (Gửi OTP)
### <a name="frontend"></a>Frontend
- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**
- **Bootstrap 5**
-----
## <a name="cấu-trúc-thư-mục"></a>📁 Cấu trúc thư mục
project-root/\
│\
├── config/          # Cấu hình hệ thống (DB, mail, JWT)\
├── controllers/    # Xử lý request / response\
├── middlewares/    # Middleware xác thực, bảo mật\
├── public/\
│   └── user/        # Giao diện client (HTML)\
│       ├── login.html\
│       ├── register.html\
│       └── home.html\
├── repositories/   # Làm việc trực tiếp với database\
├── routes/         # Định tuyến API\
├── services/       # Xử lý nghiệp vụ (auth, OTP, chat)\
├── sockets/        # Xử lý Socket.io realtime\
├── utils/          # Hàm dùng chung (OTP, email template)\
├── .env.example    # Mẫu biến môi trường\
├── package.json\
└── server.js       # File khởi động server

-----
## <a name="luồng-hoạt-động-chính"></a>🔄 Luồng hoạt động chính
### <a name="đăng-ký-tài-khoản"></a>1️⃣ Đăng ký tài khoản
- Người dùng nhập thông tin đăng ký
- Server lưu tài khoản ở trạng thái **chưa xác thực**
- Gửi mã OTP qua email
### <a name="xác-thực-otp"></a>2️⃣ Xác thực OTP
- Người dùng nhập OTP
- Server kiểm tra OTP và kích hoạt tài khoản
### <a name="đăng-nhập"></a>3️⃣ Đăng nhập
- Người dùng đăng nhập bằng email và mật khẩu
- Server trả về **JWT Token**
### <a name="chat-realtime"></a>4️⃣ Chat realtime
- Client tham gia room chat (1-1 hoặc nhóm)
- Gửi tin nhắn qua Socket.io
- Server lưu tin nhắn vào database
- Server emit tin nhắn realtime đến các client liên quan
- Client gửi ACK xác nhận:
Đã nhận
Đã xem
### <a name="chat-realtime"></a>5️⃣Gửi file 
- Client chọn file (< 1MB)
- Client upload file qua HTTP
- Server trả về URL file
- Client gửi tin nhắn chứa URL qua Socket.io
-----
## <a name="cài-đặt-chạy-project"></a>⚙️ Cài đặt & chạy project
### <a name="clone-project"></a>1️⃣ Clone project
git clone https://github.com/HPhi1808/WebChat.git
### <a name="cài-đặt-thư-viện"></a>2️⃣ Cài đặt thư viện
npm install
### <a name="tạo-file-môi-trường"></a>3️⃣ Tạo file môi trường
cp .env.example .env

Điền các giá trị cần thiết trong file .env
### <a name="chạy-server"></a>4️⃣ Chạy server
npm start

Server mặc định chạy tại:

http://localhost:PORT

-----
## <a name="bảo-mật"></a>🔐 Bảo mật
- Mật khẩu được **hash bằng bcrypt**
- Xác thực bằng **JWT**
- OTP có thời hạn
- Các API bảo vệ bằng middleware

