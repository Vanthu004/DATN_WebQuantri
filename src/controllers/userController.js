// src/controllers/userController.js
const User = require('../models/user');
const EmailVerificationToken = require('../models/EmailVerificationToken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const { validationResult } = require("express-validator");
const crypto = require('crypto');
const mongoose = require("mongoose")
const createError = require("http-errors");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { createClient } = require('@supabase/supabase-js');
const cloudinary = require('cloudinary').v2;



// Khởi tạo Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// Hàm tạo transporter email
const createEmailTransporter = () => {
  // Kiểm tra các biến môi trường cần thiết
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    throw new Error("EMAIL_USERNAME và EMAIL_PASSWORD phải được cấu hình trong file .env");
  }

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
      subject: "Mã xác nhận đăng ký tài khoản",
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
// Lấy tất cả users (không lấy user đã xóa nếu có is_deleted)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").populate("avatar");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy thông tin người dùng theo ID
exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const user = await User.findById(userId)
      .select("-password")
      .populate("avatar");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Tạo user mới
exports.createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      confirmPassword,
      name,
      role,
      phone_number,
      address,
      avatar,
      avata_url,
    } = req.body;
    // Kiểm tra password_confirm
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }
    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }
    // Mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo OTP 6 số cho xác nhận email
    const verificationOtp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      phone_number,
      address,
      email_verified: false,
      email_verification_otp: verificationOtp,
      email_verification_expires: new Date(Date.now() + 10 * 60 * 1000), // 10 phút
      avatar: avatar || null,
      avata_url: avata_url || "",
    });
    await user.save();

    // Lưu OTP vào database
    await EmailVerificationToken.create({
      email,
      otp: verificationOtp,
    });

    // Gửi email xác nhận
    const emailSent = await sendVerificationEmail(email, verificationOtp);

    if (!emailSent) {
      console.warn("⚠️ Không thể gửi email xác nhận, nhưng user vẫn được tạo thành công");
    }

    // Tạo token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    const populated = await User.findById(user._id)
      .select("-password")
      .populate("avatar");

    const responseMessage = emailSent
      ? "Tạo user thành công và đã gửi email xác nhận"
      : "Tạo user thành công nhưng không thể gửi email xác nhận. Vui lòng kiểm tra cấu hình email.";

    res.status(201).json({
      message: responseMessage,
      user: populated,
      token,
      emailSent: emailSent
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone_number, email, gender, address, avatar_url } = req.body;

    // Validation cơ bản
    if (!name || !email) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ họ tên và email",
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email không đúng định dạng",
      });
    }

    // Validate phone (chỉ khi có phone)
    if (phone_number) {
      const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({
          message: "Số điện thoại không đúng định dạng Việt Nam",
        });
      }
    }

    // Validate gender
    if (gender && !["male", "female", "other"].includes(gender)) {
      return res.status(400).json({
        message: "Giới tính không hợp lệ",
      });
    }

    // Kiểm tra email trùng
    const existingUserWithEmail = await User.findOne({
      email: email,
      _id: { $ne: userId },
    });
    if (existingUserWithEmail) {
      return res.status(400).json({
        message: "Email đã được sử dụng bởi tài khoản khác",
      });
    }

    // Kiểm tra phone trùng (nếu có)
    if (phone_number) {
      const existingUserWithPhone = await User.findOne({
        phone_number: phone_number,
        _id: { $ne: userId },
      });
      if (existingUserWithPhone) {
        return res.status(400).json({
          message: "Số điện thoại đã được sử dụng bởi tài khoản khác",
        });
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      address: address ? address.trim() : "",
    };

    if (phone_number) {
      updateData.phone_number = phone_number.trim();
    }

    if (gender) {
      updateData.gender = gender;
    }

    // Cập nhật avatar_url nếu có
    if (avatar_url) {
      updateData.avata_url = avatar_url;
    }

    // Cập nhật user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.status(200).json({
      message: "Cập nhật thông tin cá nhân thành công",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật user
exports.updateUser = async (req, res) => {
  try {
    const { password, avatar, avata_url, ...updateData } = req.body;

    // Nếu có password thì mã hóa
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...updateData,
          avatar: avatar || null,
          avata_url: avata_url || "",
        },
      },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("avatar");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.status(200).json({ message: "Cập nhật user thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// Cập nhật user theo ID (cho admin)

// exports.updateUser = async (req, res) => {
//   try {
//     const { password, avatar, avata_url, ...updateData } = req.body;

//     // Nếu có password thì mã hóa
//     if (password) {
//       updateData.password = await bcrypt.hash(password, 10);
//     }

//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: {
//           ...updateData,
//           avatar: avatar || null,
//           avata_url: avata_url || "",
//         },
//       },
//       { new: true, runValidators: true }
//     )
//       .select("-password")
//       .populate("avatar");

//     if (!user) {
//       return res.status(404).json({ message: "Không tìm thấy user" });
//     }

//     res.status(200).json({ message: "Cập nhật user thành công", user });
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi server", error: error.message });
//   }
// };

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy userId từ token đã xác thực
    const { currentPassword, newPassword } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới",
      });
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // Lấy thông tin user hiện tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    // Kiểm tra mật khẩu hiện tại có đúng không
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    // Kiểm tra mật khẩu mới có khác mật khẩu hiện tại không
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSame) {
      return res.status(400).json({
        message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
      });
    }

    // Mã hóa mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Ban user
exports.blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, "ID người dùng không hợp lệ");
    }

    const { isBanned, bannedUntil, reason } = req.body;

    const banData = {
      isBanned: isBanned === true,
      bannedUntil: isBanned ? bannedUntil || null : null,
      reason: isBanned ? reason || "" : "",
    };

    const user = await User.findByIdAndUpdate(id, { ban: banData }, { new: true })
      .select("-password")
      .populate("avatar");

    if (!user) {
      throw createError(404, "Không tìm thấy người dùng");
    }

    if (banData.isBanned) {
      const io = req.app.get("io");
      if (io) {
        io.to(id).emit("banned", {
          message: `Tài khoản của bạn đã bị khóa${
            banData.bannedUntil ? ` đến ${new Date(banData.bannedUntil).toLocaleString("vi-VN")}` : " vĩnh viễn"
          }${banData.reason ? ` vì: ${banData.reason}` : ""}`,
        });
        console.log(`WebSocket: Sent banned event to user ${id}`);
      } else {
        console.warn("WebSocket: io not initialized");
      }
    }

    res.status(200).json({
      message: isBanned ? "Đã khóa (ban) tài khoản người dùng" : "Đã mở khóa (unban) tài khoản người dùng",
      user,
    });
  } catch (error) {
    console.error("Block user error:", error);
    next(error);
  }
};

// Xóa user (xóa thật)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    res.status(200).json({ message: "Xóa user thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("avatar");
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Kiểm tra trạng thái ban
    if (user.ban?.isBanned) {
      if (user.ban.bannedUntil && user.ban.bannedUntil < new Date()) {
        user.ban = {
          isBanned: false,
          bannedUntil: null,
          reason: ""
        };
        await user.save();
      } else {
        return res.status(403).json({
          message:
            `Tài khoản của bạn đã bị khóa` +
            (user.ban.bannedUntil
              ? ` đến ${new Date(user.ban.bannedUntil).toLocaleString("vi-VN")}`
              : " vĩnh viễn") +
            (user.ban.reason ? `. Lý do: ${user.ban.reason}` : ""),
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công",
      user: { ...user._doc, password: undefined },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


// Lấy ảnh avatar của user
exports.getAvatar = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("avata_url");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    if (!user.avata_url) {
      return res.status(404).json({ message: "User chưa có ảnh avatar" });
    }

    // Trả về Base64 image
    res.status(200).json({
      avata_url: user.avata_url,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// Cập nhật avatar cho user
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { uploadId } = req.body;

    if (!uploadId) {
      return res.status(400).json({
        message: "Vui lòng cung cấp uploadId của avatar",
      });
    }

    // Kiểm tra xem upload có tồn tại không
    const Upload = require("../models/uploadModel");
    const upload = await Upload.findById(uploadId);

    if (!upload) {
      return res.status(404).json({
        message: "Không tìm thấy avatar",
      });
    }

    // Cập nhật user với avatar mới
    const user = await User.findByIdAndUpdate(
      userId,
      {
        avatar: uploadId,

        avata_url: upload.url
      },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("avatar");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.status(200).json({
      message: "Cập nhật avatar thành công",
      user,
    });
  } catch (error) {
    console.error("Update avatar error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy thông tin người dùng hiện tại (đã xác thực)
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw createError(401, "ID người dùng không hợp lệ");
    }

    const user = await User.findById(userId)
      .select("-password")
      .populate("avatar");

    if (!user) {
      throw createError(404, "Không tìm thấy người dùng");
    }

    const now = new Date();
    if (user.ban?.isBanned && user.ban.bannedUntil && new Date(user.ban.bannedUntil) > now) {
      throw createError(
        403,
        `Tài khoản của bạn đã bị khóa đến ${new Date(user.ban.bannedUntil).toLocaleString("vi-VN")}${
          user.ban.reason ? ` vì: ${user.ban.reason}` : ""
        }`
      );
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    next(error);
  }
};

// Lấy Supabase token
exports.getSupabaseToken = async (req, res) => {
  console.log('Running getSupabaseToken version: 2025-08-03');
  console.log('req.user:', req.user);
  try {
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Header Authorization không hợp lệ' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token);
    if (!token) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded JWT:', decoded);
    } catch (error) {
      console.error('JWT verification error:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token đã hết hạn' });
      }
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    if (!decoded.userId) {
      return res.status(400).json({ message: 'Token không chứa userId' });
    }

    const user = await User.findById(decoded.userId).populate('avatar');
    if (!user) {
      console.error('User not found for ID:', decoded.userId);
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    console.log('User found:', user);

    if (user.ban?.isBanned) {
      if (!user.ban.bannedUntil || user.ban.bannedUntil > new Date()) {
        return res.status(403).json({
          message: `Tài khoản của bạn đã bị khóa` +
            (user.ban.bannedUntil ? ` đến ${user.ban.bannedUntil.toLocaleString('vi-VN')}` : ' vĩnh viễn') +
            (user.ban.reason ? ` vì: ${user.ban.reason}` : '')
        });
      }
    }

    // Tạo JWT thủ công
    const supabaseToken = jwt.sign(
      {
        sub: decoded.userId,
        email: user.email,
        role: user.role,
        aud: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 // Hết hạn sau 1 giờ
      },
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    res.status(200).json({
      message: 'Tạo token Supabase thành công',
      supabaseToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        avata_url: user.avata_url
      }
    });
  } catch (error) {
    console.error('Supabase token error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
// Upload ảnh lên Cloudinary
exports.uploadImage = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Header Authorization không hợp lệ' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({ message: 'Token không chứa userId hợp lệ' });
    }

    // Kiểm tra file upload
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng cung cấp file ảnh' });
    }

    // Upload ảnh lên Cloudinary
    const result = await cloudinary.uploader.upload_stream({
      folder: 'sportshop_chat',
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    }).end(req.file.buffer);

    res.status(200).json({
      message: 'Upload ảnh thành công',
      image_url: result.secure_url
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Lỗi upload ảnh', error: error.message });
  }
};


// gửi tin nhắn
// userController.js
exports.getMessages = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Header Authorization không hợp lệ' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Token không chứa userId hợp lệ' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const { receiver_id } = req.query;
    if (!receiver_id) {
      return res.status(400).json({ message: 'Vui lòng cung cấp receiver_id' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const supabaseToken = jwt.sign(
      {
        sub: decoded.userId,
        email: user.email,
        role: user.role,
        aud: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 60 * 60
      },
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: supabaseToken,
      refresh_token: ''
    });

    if (sessionError) {
      console.error('Supabase session error:', sessionError);
      return res.status(500).json({ message: 'Lỗi đăng nhập Supabase', error: sessionError.message });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${decoded.userId},receiver_id.eq.${decoded.userId}`)
      .eq('receiver_id', receiver_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ message: 'Lỗi lấy tin nhắn', error: error.message });
    }

    // Định dạng tin nhắn cho GiftedChat
    const messages = data.map(message => ({
      _id: message.id,
      text: message.content || '',
      image: message.image_url || null,
      createdAt: new Date(message.created_at),
      user: {
        _id: message.sender_id,
        name: message.sender_id === decoded.userId ? user.name : 'Other User',
        avatar: message.sender_id === decoded.userId ? user.avata_url : ''
      }
    }));

    res.status(200).json({
      message: 'Lấy tin nhắn thành công',
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};