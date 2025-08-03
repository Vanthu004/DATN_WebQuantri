// userController.js - Controller for User Management
const User = require('../models/user');
const EmailVerificationToken = require('../models/EmailVerificationToken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const { validationResult } = require("express-validator");
const crypto = require('crypto');
const mongoose = require("mongoose");
const createError = require("http-errors");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { createClient } = require('@supabase/supabase-js');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');



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
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    throw new Error("EMAIL_USERNAME và EMAIL_PASSWORD phải được cấu hình trong file .env");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
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
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Lỗi gửi email: ${error.message}`, {
      code: error.code,
      details: error
    });
    return false;
  }
};

// Hàm kiểm tra và cập nhật trạng thái ban
const checkAndUpdateBanStatus = async (user) => {
  if (user.ban?.isBanned && user.ban.bannedUntil && user.ban.bannedUntil < new Date()) {
    user.ban = {
      isBanned: false,
      bannedUntil: null,
      reason: ""
    };
    await user.save();
  }
  return user;
};

// Tạo user mới
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      confirmPassword,
      name,
      role,
      phone_number,
      address,
      avatar,
      avatar_url,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Tạo user trong MongoDB
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'user',
      phone_number,
      address,
      email_verified: false,
      email_verification_otp: verificationOtp,
      email_verification_expires: new Date(Date.now() + 10 * 60 * 1000),
      avatar: avatar || null,
      avatar_url: avatar_url || "",
    });

    // Tạo user trong Supabase
    console.log('Creating Supabase user:', { email, name, userId: user._id.toString() });
    const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { id: user._id.toString(), name },
      email_confirm: true, // Tự động xác nhận email
    });

    if (supabaseError) {
      console.error('Create Supabase user error:', supabaseError.message);
      return res.status(500).json({ message: 'Lỗi tạo user trong Supabase', error: supabaseError.message });
    }

    // Lưu supabase_user_id vào MongoDB
    user.supabase_user_id = supabaseUser.user.id;
    await user.save();

    console.log('Supabase user created:', supabaseUser.user.id);

    // Gửi email xác nhận OTP
    await EmailVerificationToken.create({
      email,
      otp: verificationOtp,
    });
    const emailSent = await sendVerificationEmail(email, verificationOtp);

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    const populated = await User.findById(user._id)
      .select("-password")
      .populate("avatar");

    const responseMessage = emailSent
      ? "Tạo user thành công và đã gửi email xác nhận"
      : "Tạo user thành công nhưng không thể gửi email xác nhận";

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

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!name || !email) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ họ tên và email" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email không đúng định dạng" });
    }

    if (phone_number) {
      const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({ message: "Số điện thoại không đúng định dạng Việt Nam" });
      }
    }

    if (gender && !["male", "female", "other"].includes(gender)) {
      return res.status(400).json({ message: "Giới tính không hợp lệ" });
    }

    const existingUserWithEmail = await User.findOne({
      email: email,
      _id: { $ne: userId },
    });
    if (existingUserWithEmail) {
      return res.status(400).json({ message: "Email đã được sử dụng bởi tài khoản khác" });
    }

    if (phone_number) {
      const existingUserWithPhone = await User.findOne({
        phone_number: phone_number,
        _id: { $ne: userId },
      });
      if (existingUserWithPhone) {
        return res.status(400).json({ message: "Số điện thoại đã được sử dụng bởi tài khoản khác" });
      }
    }

    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      address: address ? address.trim() : "",
      phone_number: phone_number ? phone_number.trim() : undefined,
      gender: gender || undefined,
      avatar_url: avatar_url || undefined,
    };

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
    console.error(`Update profile error: ${error.message}`);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật user
exports.updateUser = async (req, res) => {
  try {
    const { password, avatar, avatar_url, role, ...updateData } = req.body;

    // Kiểm tra quyền - chỉ admin mới được cập nhật role
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({
        message: "Bạn không có quyền thay đổi role của người dùng"
      });
    }

    // Validate role nếu có
    if (role && !['admin', 'customer', 'user'].includes(role)) {
      return res.status(400).json({
        message: "Role không hợp lệ. Role phải là: admin, customer, hoặc user"
      });
    }

    // Không cho phép admin tự hạ cấp chính mình
    if (role && req.params.id === req.user.userId && role !== 'admin') {
      return res.status(400).json({
        message: "Bạn không thể hạ cấp chính mình"
      });
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...updateData,
          role: role || undefined,
          avatar: avatar || null,
          avatar_url: avatar_url || "",
        },
      },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("avatar");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.status(200).json({
      message: "Cập nhật user thành công",
      user,
      roleUpdated: !!role
    });
  } catch (error) {
    console.error(`Update user error: ${error.message}`);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSame) {
      return res.status(400).json({ message: "Mật khẩu mới không được trùng với mật khẩu hiện tại" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error(`Change password error: ${error.message}`);
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

    // Kiểm tra quyền - chỉ admin mới được ban user
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: "Bạn không có quyền khóa/mở khóa người dùng"
      });
    }

    // Không cho phép admin tự ban chính mình
    if (id === req.user.userId) {
      return res.status(400).json({
        message: "Bạn không thể khóa chính mình"
      });
    }

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
          message: `Tài khoản của bạn đã bị khóa${banData.bannedUntil ? ` đến ${new Date(banData.bannedUntil).toLocaleString("vi-VN")}` : " vĩnh viễn"}${banData.reason ? ` vì: ${banData.reason}` : ""}`,
        });
        console.log(`WebSocket: Sent banned event to user ${id}`);
      } else {
        console.warn("WebSocket: io not initialized");
      }
    }

    res.status(200).json({
      message: isBanned ? "Đã khóa tài khoản người dùng" : "Đã mở khóa tài khoản người dùng",
      user,
    });
  } catch (error) {
    console.error(`Block user error: ${error.message}`);
    next(error);
  }
};

// Cập nhật role cho user
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Kiểm tra quyền - chỉ admin mới được cập nhật role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: "Bạn không có quyền thay đổi role của người dùng"
      });
    }

    // Validate role
    if (!role || !['admin', 'customer', 'user'].includes(role)) {
      return res.status(400).json({
        message: "Role không hợp lệ. Role phải là: admin, customer, hoặc user"
      });
    }

    // Không cho phép admin tự hạ cấp chính mình
    if (id === req.user.userId && role !== 'admin') {
      return res.status(400).json({
        message: "Bạn không thể hạ cấp chính mình"
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("avatar");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      message: `Đã cập nhật role của người dùng thành ${role}`,
      user,
      previousRole: user.role,
      newRole: role
    });
  } catch (error) {
    console.error(`Update user role error: ${error.message}`);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    res.status(200).json({ message: "Xóa user thành công" });
  } catch (error) {
    console.error(`Delete user error: ${error.message}`);
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

    await checkAndUpdateBanStatus(user);

    if (user.ban?.isBanned) {
      return res.status(403).json({
        message: `Tài khoản của bạn đã bị khóa${user.ban.bannedUntil ? ` đến ${new Date(user.ban.bannedUntil).toLocaleString("vi-VN")}` : " vĩnh viễn"}${user.ban.reason ? `. Lý do: ${user.ban.reason}` : ""}`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công",
      user: { ...user._doc, password: undefined },
      token,
    });
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy ảnh avatar của user
exports.getAvatar = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("avatar_url");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    if (!user.avatar_url) {
      return res.status(404).json({ message: "User chưa có ảnh avatar" });
    }

    res.status(200).json({ avatar_url: user.avatar_url });
  } catch (error) {
    console.error(`Get avatar error: ${error.message}`);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật avatar cho user
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { uploadId } = req.body;

    if (!uploadId) {
      return res.status(400).json({ message: "Vui lòng cung cấp uploadId của avatar" });
    }

    const Upload = require("../models/uploadModel");
    const upload = await Upload.findById(uploadId);
    if (!upload) {
      return res.status(404).json({ message: "Không tìm thấy avatar" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: uploadId, avatar_url: upload.url },
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
    console.error(`Update avatar error: ${error.message}`);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy thông tin người dùng hiện tại
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

    await checkAndUpdateBanStatus(user);

    if (user.ban?.isBanned) {
      throw createError(
        403,
        `Tài khoản của bạn đã bị khóa${user.ban.bannedUntil ? ` đến ${new Date(user.ban.bannedUntil).toLocaleString("vi-VN")}` : ""}${user.ban.reason ? ` vì: ${user.ban.reason}` : ""}`
      );
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(`Get current user error: ${error.message}`);
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

    console.log('File buffer:', req.file.buffer.length, 'bytes');
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    });

    // Upload ảnh lên Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'swear_chat', // Sửa thành folder đúng
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    console.log('Cloudinary response:', result);

    res.status(200).json({
      message: 'Upload ảnh thành công',
      image_url: result.secure_url
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Lỗi upload ảnh', error: error.message });
  }
};
// Tạo tin nhắn
exports.sendMessage = async (req, res) => {
  console.log('Running sendMessage version: 2025-08-04');
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

    const { receiver_id, content, image_url } = req.body;
    if (!receiver_id || (!content && !image_url)) {
      return res.status(400).json({ message: 'Vui lòng cung cấp receiver_id và nội dung hoặc ảnh' });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase configuration:', {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      });
      return res.status(500).json({ message: 'Lỗi cấu hình Supabase' });
    }

    // Sử dụng service_role key cho admin access
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: decoded.userId,
        receiver_id,
        content: content || null,
        image_url: image_url || null
      })
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ message: 'Lỗi gửi tin nhắn', error: error.message });
    }

    res.status(201).json({
      message: 'Gửi tin nhắn thành công',
      data
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy tin nhắn
exports.getMessages = async (req, res) => {
  console.log('Running getMessages version: 2025-08-04');
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Không có thông tin người dùng từ middleware' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      console.error('User not found for ID:', req.user.userId);
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const { receiver_id } = req.query;
    if (!receiver_id) {
      return res.status(400).json({ message: 'Vui lòng cung cấp receiver_id' });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase configuration:', {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      });
      return res.status(500).json({ message: 'Lỗi cấu hình Supabase' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${req.user.userId},receiver_id.eq.${req.user.userId}`)
      .eq('receiver_id', receiver_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ message: 'Lỗi lấy tin nhắn', error: error.message });
    }

    const messages = data.map(message => ({
      _id: message.id,
      text: message.content || '',
      image: message.image_url || null,
      createdAt: new Date(message.created_at),
      user: {
        _id: message.sender_id,
        name: message.sender_id === req.user.userId ? user.name : 'Other User',
        avatar: message.sender_id === req.user.userId ? user.avata_url : ''
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

// Lấy tin nhắn
exports.getConversations = async (req, res) => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const adminId = req.user.userId; // Từ JWT (authMiddleware)

    // Lấy tất cả tin nhắn liên quan đến admin từ Supabase
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, content, image_url, created_at, sender_id, receiver_id')
      .or(`sender_id.eq.${adminId},receiver_id.eq.${adminId}`)
      .order('created_at', { ascending: false });

    if (messagesError) {
      throw new Error(messagesError.message);
    }

    // Lấy danh sách user duy nhất (không phải admin)
    const userIds = new Set(messages.map((msg) =>
      msg.sender_id === adminId ? msg.receiver_id : msg.sender_id
    ));

    // Lấy thông tin user từ MongoDB và tin nhắn mới nhất từ Supabase
    const users = await Promise.all(
      Array.from(userIds).map(async (userId) => {
        try {
          // Lấy user từ MongoDB
          const user = await User.findById(userId);
          if (!user || !['user', 'customer'].includes(user.role)) {
            return null;
          }

          // Lấy tin nhắn mới nhất từ Supabase
          const { data: latestMessage, error: messageError } = await supabase
            .from('messages')
            .select('id, content, image_url, created_at, sender_id, receiver_id')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .or(`sender_id.eq.${adminId},receiver_id.eq.${adminId}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (messageError) {
            throw new Error(messageError.message);
          }

          return {
            _id: user._id.toString(),
            name: user.name,
            avata_url: user.avata_url || '',
            role: user.role,
            ban: user.ban || { isBanned: false, bannedUntil: null, reason: '' },
            gender: user.gender || 'other',
            email_verified: user.email_verified || false,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            latestMessage: latestMessage
              ? {
                  _id: latestMessage.id,
                  text: latestMessage.content,
                  image: latestMessage.image_url,
                  createdAt: latestMessage.created_at,
                  user: {
                    _id: userId,
                    name: user.name,
                    avatar: user.avata_url || ''
                  }
                }
              : undefined
          };
        } catch (error) {
          console.error(`Lỗi khi lấy dữ liệu cho user ${userId}:`, error);
          return null;
        }
      })
    );

    // Lọc bỏ null
    const filteredUsers = users.filter(user => user !== null);

    res.status(200).json({ message: 'Lấy danh sách cuộc trò chuyện thành công', data: filteredUsers });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
