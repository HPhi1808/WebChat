# Real-time Chat Application

Ứng dụng nhắn tin thời gian thực hỗ trợ Chat 1-1, Chat Nhóm và Gửi file đa phương tiện.
Dự án được xây dựng bằng **Node.js**, **Socket.io** và **Supabase**.

## 🚀 Tính năng chính

- **Xác thực:** Đăng ký, Đăng nhập (JWT).
- **Chat Real-time:** Nhắn tin tức thì không cần load lại trang.
- **Phân loại Chat:**
  - **Chat 1-1 (Private):** Trò chuyện riêng tư.
  - **Chat Nhóm (Group):** Tạo nhóm, thêm thành viên, quản lý (Admin có quyền xóa thành viên/giải tán nhóm).
- **Trạng thái:**
  - Online / Offline / Last seen (Lần cuối truy cập).
  - Typing Indicator (Đang soạn tin...).
  - Message Status (Đã gửi / Đã xem).
- **Đa phương tiện:**
  - Gửi hình ảnh, video, âm thanh.
  - Gửi tệp tin (Word, PDF, ZIP...).
  - Hỗ trợ xem trước (Preview) media ngay trong khung chat.

## 🛠 Công nghệ sử dụng

- **Backend:** Node.js, Express.js.
- **Real-time Engine:** Socket.io (WebSocket).
- **Database:** Supabase (PostgreSQL).
- **Storage:** Supabase Storage (Lưu trữ file).
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5.

## ⚙️ Cài đặt & Chạy dự án

### 1. Clone dự án

    git clone https://github.com/HPhi1808/WebChat.git
### 2. Cài đặt thư viện
    npm install

### 3. Cấu hình biến môi trường (.env)
Tạo file .env

    copy .env.example .env
và gán giá trị cho các Key trong file .env

### 4. Cấu hình Database (SQL)
Chạy các lệnh SQL sau trong Supabase Editor để tạo bảng:

-- 1. Kích hoạt Extension UUID (Bắt buộc để tạo ID ngẫu nhiên)

    create extension if not exists "uuid-ossp";

-- 2. Bảng Users

    create table public.users (
      id uuid default uuid_generate_v4() primary key,
      email text unique not null,
      password text not null,
      full_name text,
      avatar_url text,
      is_online boolean default false,
      last_seen timestamptz default now()
    );

-- 3. Bảng OTP Codes (Dùng cho xác thực)

    create table public.otp_codes (
      id uuid not null default uuid_generate_v4(),
      email character varying(255) not null,
      code character varying(10) not null,
      expires_at timestamp with time zone not null,
      created_at timestamp with time zone null default now(),
      constraint otp_codes_pkey primary key (id)
    ) TABLESPACE pg_default;

-- 4. Bảng Conversations

    create table public.conversations (
      id uuid default uuid_generate_v4() primary key,
      type text check (type in ('private', 'group')),
      name text,
      image_url text,
      last_message_id uuid,
      last_message_at timestamptz default now(),
      created_at timestamptz default now()
    );

-- 5. Bảng Conversation Members

    create table public.conversation_members (
      conversation_id uuid references conversations(id) on delete cascade,
      user_id uuid references users(id) on delete cascade,
      role text default 'member', -- 'admin' hoặc 'member'
      joined_at timestamptz default now(),
      primary key (conversation_id, user_id)
    );

-- 6. Bảng Messages

    create table public.messages (
      id uuid default uuid_generate_v4() primary key,
      conversation_id uuid references conversations(id) on delete cascade,
      sender_id uuid references users(id) on delete set null,
      content text,
      type text default 'text', -- text, image, video, audio, file
      file_name text,
      file_size text,
      status text default 'sent', -- sent, read
      created_at timestamptz default now()
    );

  

### 5. Chạy dự án
    npm start
Truy cập: `http://localhost:3000`
