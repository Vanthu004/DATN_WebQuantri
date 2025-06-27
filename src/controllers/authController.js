const User = require("../models/user");
const PasswordResetToken = require('../models/PasswordResetToken');
const EmailVerificationToken = require('../models/EmailVerificationToken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Hàm tạo transporter email
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    debug: true,
    logger: true
  });
};

// Hàm gửi email xác nhận OTP
const sendVerificationEmail = async (email, otp) => {
  const transporter = createEmailTransporter();
  
  await transporter.sendMail({
    from: `"Swear Support" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: 'Mã xác nhận đăng ký tài khoản',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xác nhận đăng ký tài khoản</h2>
        <p>Xin chào,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhập mã OTP bên dưới để xác nhận email của bạn:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p><strong>Lưu ý:</strong> Mã OTP này sẽ hết hạn sau 10 phút.</p>
        <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br>Đội ngũ Swear</p>
      </div>
    `,
  });
};

// Gửi lại email xác nhận OTP
exports.sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }
    
    if (user.email_verified) {
      return res.status(400).json({ message: 'Email đã được xác nhận trước đó' });
    }

    // Tạo OTP 6 số mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Cập nhật OTP trong database
    await EmailVerificationToken.deleteMany({ email }); // Xóa OTP cũ
    await EmailVerificationToken.create({ email, otp });
    
    // Cập nhật OTP trong user
    await User.findOneAndUpdate(
      { email },
      { 
        email_verification_otp: otp,
        email_verification_expires: new Date(Date.now() + 10 * 60 * 1000)
      }
    );
    
    // Gửi email
    await sendVerificationEmail(email, otp);
    
    res.json({ message: 'Mã xác nhận đã được gửi lại về email' });
  } catch (error) {
    console.error('❌ Lỗi gửi email xác nhận:', error);
    res.status(500).json({ message: 'Lỗi server khi gửi mã xác nhận' });
  }
};

// Xác nhận email bằng OTP
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Tìm OTP trong database
    const verificationRecord = await EmailVerificationToken.findOne({ email, otp });
    if (!verificationRecord) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }
    
    // Kiểm tra OTP có hết hạn chưa
    if (new Date() > verificationRecord.expireAt) {
      await EmailVerificationToken.deleteMany({ email });
      return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
    }
    
    // Cập nhật trạng thái xác nhận email
    await User.findOneAndUpdate(
      { email },
      { 
        email_verified: true,
        email_verification_otp: null,
        email_verification_expires: null
      }
    );
    
    // Xóa OTP sau khi sử dụng
    await EmailVerificationToken.deleteMany({ email });
    
    res.json({ message: 'Email đã được xác nhận thành công' });
  } catch (error) {
    console.error('❌ Lỗi xác nhận email:', error);
    res.status(500).json({ message: 'Lỗi server khi xác nhận email' });
  }
};

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

  return nodemailer.createTransport({
    service: "gmail", // Sử dụng service thay vì host/port
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD, // Phải là App Password, không phải password thường
    },
  });
};

// Hàm gửi email xác nhận OTP
const sendVerificationEmail = async (email, otp) => {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `"Swear Support" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Mã xác nhận đăng ký tài khoản',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Xác nhận đăng ký tài khoản</h2>
          <p>Xin chào,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhập mã OTP bên dưới để xác nhận email của bạn:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>Lưu ý:</strong> Mã OTP này sẽ hết hạn sau 10 phút.</p>
          <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
          <p>Trân trọng,<br>Đội ngũ Swear</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error.message);
    
    // Xử lý các lỗi cụ thể
    if (error.code === 'EAUTH') {
      console.error("🔐 Lỗi xác thực email. Vui lòng kiểm tra:");
      console.error("   - EMAIL_USERNAME trong file .env");
      console.error("   - EMAIL_PASSWORD phải là App Password (không phải password thường)");
      console.error("   - Bật 2FA cho Gmail và tạo App Password");
    } else if (error.code === 'ECONNECTION') {
      console.error("🌐 Lỗi kết nối email server");
    } else {
      console.error("📧 Lỗi gửi email khác:", error);
    }
    
    return false;
  }
};

// Hàm gửi email reset password
const sendPasswordResetEmail = async (email, otp) => {
  try {
    const transporter = createEmailTransporter();

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
          <p>Trân trọng,<br>Đội ngũ Swear</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Lỗi gửi email reset password:", error.message);
    
    // Xử lý các lỗi cụ thể
    if (error.code === 'EAUTH') {
      console.error("🔐 Lỗi xác thực email. Vui lòng kiểm tra:");
      console.error("   - EMAIL_USERNAME trong file .env");
      console.error("   - EMAIL_PASSWORD phải là App Password (không phải password thường)");
      console.error("   - Bật 2FA cho Gmail và tạo App Password");
    } else if (error.code === 'ECONNECTION') {
      console.error("🌐 Lỗi kết nối email server");
    } else {
      console.error("📧 Lỗi gửi email khác:", error);
    }
    
    return false;
  }
};

// Gửi lại email xác nhận OTP
exports.sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }
    
    if (user.email_verified) {
      return res.status(400).json({ message: 'Email đã được xác nhận trước đó' });
    }

    // Tạo OTP 6 số mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Cập nhật OTP trong database
    await EmailVerificationToken.deleteMany({ email }); // Xóa OTP cũ
    await EmailVerificationToken.create({ email, otp });
    
    // Cập nhật OTP trong user
    await User.findOneAndUpdate(
      { email },
      { 
        email_verification_otp: otp,
        email_verification_expires: new Date(Date.now() + 10 * 60 * 1000)
      }
    );
    
    // Gửi email
    const emailSent = await sendVerificationEmail(email, otp);
    
    if (!emailSent) {
      console.warn("⚠️ Không thể gửi email xác nhận");
      return res.status(500).json({ 
        message: 'Không thể gửi email. Vui lòng kiểm tra cấu hình email server.' 
      });
    }
    
    res.json({ message: 'Mã xác nhận đã được gửi lại về email' });
  } catch (error) {
    console.error('❌ Lỗi gửi email xác nhận:', error);
    res.status(500).json({ message: 'Lỗi server khi gửi mã xác nhận' });
  }
};

// Xác nhận email bằng OTP
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Tìm OTP trong database
    const verificationRecord = await EmailVerificationToken.findOne({ email, otp });
    if (!verificationRecord) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }
    
    // Kiểm tra OTP có hết hạn chưa
    if (new Date() > verificationRecord.expireAt) {
      await EmailVerificationToken.deleteMany({ email });
      return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
    }
    
    // Cập nhật trạng thái xác nhận email
    await User.findOneAndUpdate(
      { email },
      { 
        email_verified: true,
        email_verification_otp: null,
        email_verification_expires: null
      }
    );
    
    // Xóa OTP sau khi sử dụng
    await EmailVerificationToken.deleteMany({ email });
    
    res.json({ message: 'Email đã được xác nhận thành công' });
  } catch (error) {
    console.error('❌ Lỗi xác nhận email:', error);
    res.status(500).json({ message: 'Lỗi server khi xác nhận email' });
  }
};

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

    // Gửi email reset password
    const emailSent = await sendPasswordResetEmail(email, otp);
    
    if (!emailSent) {
      console.warn("⚠️ Không thể gửi email reset password");
      return res.status(500).json({ 
        message: 'Không thể gửi email. Vui lòng kiểm tra cấu hình email server.' 
      });
    }

    console.log('✅ Email reset password đã được gửi thành công đến:', email);
    res.json({ message: 'OTP đã được gửi về email' });
  } catch (error) {
    console.error('❌ Lỗi gửi email reset password:', error);
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
