# Hướng dẫn cấu hình Email Gmail cho ứng dụng

## Vấn đề hiện tại
Lỗi `535-5.7.8 Username and Password not accepted` xảy ra vì Gmail không chấp nhận password thông thường cho ứng dụng. Gmail yêu cầu sử dụng "App Password" thay vì password thường.

## Cách khắc phục

### Bước 1: Bật 2-Factor Authentication (2FA)
1. Đăng nhập vào tài khoản Google
2. Vào **Bảo mật** (Security)
3. Bật **Xác minh 2 bước** (2-Step Verification)

### Bước 2: Tạo App Password
1. Vào **Bảo mật** (Security)
2. Tìm **Mật khẩu ứng dụng** (App passwords)
3. Chọn **Ứng dụng khác** (Other)
4. Đặt tên cho ứng dụng (ví dụ: "Swear Server")
5. Nhấn **Tạo** (Generate)
6. **Copy mật khẩu 16 ký tự** được tạo ra

### Bước 3: Cập nhật file .env
Thêm hoặc cập nhật các biến môi trường trong file `.env`:

```env
# Email Configuration
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Lưu ý quan trọng:**
- `EMAIL_PASSWORD` phải là App Password 16 ký tự, KHÔNG phải password thường
- Không bao gồm dấu cách hoặc ký tự đặc biệt khác

### Bước 4: Kiểm tra cấu hình
Chạy lại ứng dụng và thử đăng ký user mới. Bạn sẽ thấy:
- ✅ "Email sent successfully" nếu cấu hình đúng
- ❌ Thông báo lỗi cụ thể nếu vẫn có vấn đề

## Các lỗi thường gặp

### 1. Lỗi EAUTH (Authentication Error)
```
❌ Lỗi xác thực email. Vui lòng kiểm tra:
   - EMAIL_USERNAME trong file .env
   - EMAIL_PASSWORD phải là App Password (không phải password thường)
   - Bật 2FA cho Gmail và tạo App Password
```

**Giải pháp:** Làm theo các bước trên để tạo App Password

### 2. Lỗi ECONNECTION (Connection Error)
```
❌ Lỗi kết nối email server
```

**Giải pháp:** Kiểm tra kết nối internet và firewall

### 3. Lỗi EENVELOPE (Envelope Error)
```
❌ Lỗi địa chỉ email người nhận
```

**Giải pháp:** Kiểm tra định dạng email trong request

## Test cấu hình email

Tạo file `test-email.js` để test cấu hình:

```javascript
require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  try {
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Test" <${process.env.EMAIL_USERNAME}>`,
      to: "test@example.com",
      subject: "Test Email",
      text: "This is a test email",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
  }
};

testEmail();
```

Chạy test:
```bash
node test-email.js
```

## Lưu ý bảo mật

1. **Không commit file .env** vào git
2. **Bảo vệ App Password** như bảo vệ password thường
3. **Tạo App Password riêng** cho mỗi ứng dụng
4. **Xóa App Password cũ** khi không sử dụng

## Cấu hình cho production

Trong môi trường production, nên sử dụng:
- Email service chuyên nghiệp (SendGrid, Mailgun, etc.)
- SMTP server riêng
- Rate limiting để tránh spam

## Troubleshooting

### Nếu vẫn gặp lỗi sau khi làm theo hướng dẫn:

1. **Kiểm tra 2FA:** Đảm bảo 2FA đã được bật
2. **Tạo App Password mới:** Xóa App Password cũ và tạo mới
3. **Kiểm tra email:** Đảm bảo email không có dấu cách thừa
4. **Restart server:** Khởi động lại server sau khi cập nhật .env
5. **Kiểm tra logs:** Xem log chi tiết để debug

### Liên hệ hỗ trợ
Nếu vẫn gặp vấn đề, hãy cung cấp:
- Log lỗi chi tiết
- Phiên bản Node.js
- Phiên bản nodemailer
- Nội dung file .env (che thông tin nhạy cảm) 