// src/controllers/upload.controller.js
const supabase = require('../config/supabase');
const multer = require('multer');

// Cấu hình Multer: Giới hạn 50MB
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
}).single('file'); // Tên field bên frontend gửi lên là 'file'

class UploadController {
    async uploadFile(req, res) {
        upload(req, res, async function (err) {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'File quá lớn (Max 50MB)' });
                }
                return res.status(500).json({ error: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'Chưa chọn file' });
            }

            try {
                const file = req.file;
                // Tạo tên file unique để không bị trùng
                const fileExt = file.originalname.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                const filePath = `uploads/${fileName}`;

                // Upload lên Supabase Storage
                const { data, error } = await supabase.storage
                    .from('chat-files')
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false
                    });

                if (error) throw error;

                // Lấy Public URL
                const { data: publicData } = supabase.storage
                    .from('chat-files')
                    .getPublicUrl(filePath);

                // Xác định loại file (để Frontend hiển thị đúng)
                let type = 'file';
                if (file.mimetype.startsWith('image/')) type = 'image';
                else if (file.mimetype.startsWith('video/')) type = 'video';
                else if (file.mimetype.startsWith('audio/')) type = 'audio';

                return res.status(200).json({
                    url: publicData.publicUrl,
                    type: type,
                    fileName: file.originalname,
                    fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB' // Lưu kích thước
                });

            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Lỗi upload file lên Supabase' });
            }
        });
    }
}

module.exports = new UploadController();