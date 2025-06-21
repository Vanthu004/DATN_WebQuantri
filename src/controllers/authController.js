const User = require("../models/user");
const PasswordResetToken = require('../models/PasswordResetToken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Kiểm tra email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP vào database
    await PasswordResetToken.create({ email, otp });

    // Kiểm tra biến môi trường
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Lỗi: EMAIL_USERNAME hoặc EMAIL_PASSWORD không được định nghĩa');
      return res.status(500).json({ message: 'Lỗi cấu hình email server' });
    }

    console.log('📧 Đang cấu hình email với:', {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD ? '***' : 'undefined'
    });

    // Thử cấu hình SMTP với port 465 (SSL)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true, // Bật debug để xem chi tiết lỗi
      logger: true // Log to console
    });

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log('✅ Kết nối email server thành công');
    } catch (verifyError) {
      console.error('❌ Lỗi xác thực email server:', verifyError);
      
      // Thử cấu hình thay thế với port 587 (TLS)
      console.log('🔄 Thử cấu hình thay thế với port 587...');
      const transporter2 = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // use TLS
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      try {
        await transporter2.verify();
        console.log('✅ Kết nối email server thành công với port 587');
        
        // Gửi email với transporter2
        const mailOptions = {
          from: `"Swear Support" <${process.env.EMAIL_USERNAME}>`,
          to: email,
          subject: 'OTP khôi phục mật khẩu',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Khôi phục mật khẩu</h2>
              <p>Xin chào,</p>
              <p>Bạn đã yêu cầu khôi phục mật khẩu. Mã OTP của bạn là:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
              </div>
              <p><strong>Lưu ý:</strong> Mã OTP này sẽ hết hạn sau 10 phút.</p>
              <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
              <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
            </div>
          `,
        };

        await transporter2.sendMail(mailOptions);
        console.log('✅ Email đã được gửi thành công đến:', email);
        res.json({ message: 'OTP đã được gửi về email' });
        return;
      } catch (verifyError2) {
        console.error('❌ Lỗi xác thực email server với port 587:', verifyError2);
        return res.status(500).json({ 
          message: 'Lỗi xác thực email server. Vui lòng kiểm tra:\n1. Email và App Password đúng\n2. 2-Factor Authentication đã bật\n3. App Password đã được tạo cho ứng dụng Mail' 
        });
      }
    }

    // Gửi email với transporter gốc
    const mailOptions = {
      from: `"App Support" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'OTP khôi phục mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Khôi phục mật khẩu</h2>
          <p>Xin chào,</p>
          <p>Bạn đã yêu cầu khôi phục mật khẩu. Mã OTP của bạn là:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>Lưu ý:</strong> Mã OTP này sẽ hết hạn sau 10 phút.</p>
          <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
          <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email đã được gửi thành công đến:', email);

    res.json({ message: 'OTP đã được gửi về email' });
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error);
    
    if (error.code === 'EAUTH') {
      return res.status(500).json({ 
        message: 'Lỗi xác thực email. Vui lòng kiểm tra:\n1. Email và App Password đúng\n2. 2-Factor Authentication đã bật\n3. App Password đã được tạo cho ứng dụng Mail\n4. App Password không có khoảng trắng thừa' 
      });
    }
    
    res.status(500).json({ message: 'Lỗi server khi gửi OTP' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Kiểm tra OTP
    const record = await PasswordResetToken.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
    }

    // Kiểm tra OTP có hết hạn chưa
    if (new Date() > record.expireAt) {
      await PasswordResetToken.deleteMany({ email });
      return res.status(400).json({ message: 'OTP đã hết hạn' });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Cập nhật mật khẩu
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // Xóa token sau khi sử dụng
    await PasswordResetToken.deleteMany({ email });

    res.json({ message: 'Mật khẩu đã được cập nhật thành công' });
  } catch (error) {
    console.error('❌ Lỗi reset password:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật mật khẩu' });
  }
};
