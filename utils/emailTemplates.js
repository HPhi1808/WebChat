exports.getOtpEmailTemplate = (name, otp) => {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0; }
            .container { background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); max-width: 600px; margin: 40px auto; overflow: hidden; }
            .header { background-color: #007bff; padding: 30px; text-align: center; color: #ffffff; }
            .content { padding: 40px; }
            .otp-box { background-color: #f0f8ff; border: 2px dashed #007bff; border-radius: 6px; padding: 15px; font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #eeeeee; padding: 20px; font-size: 12px; color: #999; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0;">Chat Web Verify</h1>
            </div>
            <div class="content">
                <p>Xin chào <strong>${name}</strong>,</p>
                <p>Cảm ơn bạn đã đăng ký. Đây là mã xác thực (OTP) của bạn:</p>
                
                <div style="text-align: center;">
                    <div class="otp-box">${otp}</div>
                </div>

                <p style="color: #888; text-align: center;">⚠️ Mã này sẽ hết hạn trong <strong>10 phút</strong>.</p>
            </div>
            <div class="footer">
                &copy; 2026 Chat Web System. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};