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
const { createClient } = require('@supabase/supabase-js');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const winston = require('winston');

// Khởi tạo logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

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
    logger.info(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Lỗi gửi email: ${error.message}`, {
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

// Lấy tất cả users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ 'ban.isBanned': false })
      .select("-password")
      .populate("avatar");
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
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

    await checkAndUpdateBanStatus(user);
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Get user by ID error: ${error.message}`);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
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

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      phone_number,
      address,
      email_verified: false,
      email_verification_otp: verificationOtp,
      email_verification_expires: new Date(Date.now() + 10 * 60 * 1000),
      avatar: avatar || null,
      avatar_url: avatar_url || "",
    });
    await user.save();

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
      emailSent
    });
  } catch (error) {
    logger.error(`Create user error: ${error.message}`);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật hồ sơ người dùng
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
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật user
exports.updateUser = async (req, res) => {
  try {
    const { password, avatar, avatar_url, ...updateData } = req.body;

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

    await checkAndUpdateBanStatus(user);
    res.status(200).json({ message: "Cập nhật user thành công", user });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
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
    logger.error(`Change password error: ${error.message}`);
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
        logger.info(`WebSocket: Sent banned event to user ${id}`);
      } else {
        logger.warn("WebSocket: io not initialized");
      }
    }

    res.status(200).json({
      message: isBanned ? "Đã khóa tài khoản người dùng" : "Đã mở khóa tài khoản người dùng",
      user,
    });
  } catch (error) {
    logger.error(`Block user error: ${error.message}`);
    next(error);
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
    logger.error(`Delete user error: ${error.message}`);
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
    logger.error(`Login error: ${error.message}`);
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
    logger.error(`Get avatar error: ${error.message}`);
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
    logger.error(`Update avatar error: ${error.message}`);
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
    logger.error(`Get current user error: ${error.message}`);
    next(error);
  }
};

// Lấy Supabase token
exports.getSupabaseToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Header Authorization không hợp lệ' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(400).json({ message: 'Token không chứa userId' });
    }

    const user = await User.findById(decoded.userId).populate('avatar');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await checkAndUpdateBanStatus(user);

    if (user.ban?.isBanned) {
      return res.status(403).json({
        message: `Tài khoản của bạn đã bị khóa${user.ban.bannedUntil ? ` đến ${user.ban.bannedUntil.toLocaleString('vi-VN')}` : ' vĩnh viễn'}${user.ban.reason ? ` vì: ${user.ban.reason}` : ''}`
      });
    }

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

    res.status(200).json({
      message: 'Tạo token Supabase thành công',
      supabaseToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    logger.error(`Supabase token error: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }
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

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng cung cấp file ảnh' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'swear_chat',
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    res.status(200).json({
      message: 'Upload ảnh thành công',
      image_url: result.secure_url
    });
  } catch (error) {
    logger.error(`Cloudinary upload error: ${error.message}`);
    res.status(500).json({ message: 'Lỗi upload ảnh', error: error.message });
  }
};

// Tạo tin nhắn
exports.sendMessage = async (req, res) => {
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

    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json({ message: 'Không tìm thấy người nhận' });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: decoded.userId,
        receiver_id,
        content: content || null,
        image_url: image_url || null,
        sender_name: user.name,
        sender_avatar_url: user.avatar_url || null
      })
      .select();

    if (error) {
      logger.error(`Supabase insert error: ${error.message}`);
      return res.status(500).json({ message: 'Lỗi gửi tin nhắn', error: error.message });
    }

    res.status(201).json({
      message: 'Gửi tin nhắn thành công',
      data
    });
  } catch (error) {
    logger.error(`Send message error: ${error.message}`);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy tin nhắn
exports.getMessages = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Không có thông tin người dùng từ middleware' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const { receiver_id } = req.query;
    if (!receiver_id) {
      return res.status(400).json({ message: 'Vui lòng cung cấp receiver_id' });
    }

    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json({ message: 'Không tìm thấy người nhận' });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('id, content, image_url, created_at, sender_id, receiver_id, sender_name, sender_avatar_url')
      .or(
        `and(sender_id.eq.${req.user.userId},receiver_id.eq.${receiver_id}),` +
        `and(sender_id.eq.${receiver_id},receiver_id.eq.${req.user.userId})`
      )
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Supabase fetch error: ${error.message}`);
      return res.status(500).json({ message: 'Lỗi lấy tin nhắn', error: error.message });
    }

    const messages = data.map((message) => ({
      _id: message.id,
      text: message.content || '',
      image: message.image_url || null,
      createdAt: message.created_at,
      user: {
        _id: message.sender_id,
        name: message.sender_name || 'Unknown User',
        avatar: message.sender_avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${message.sender_id}`,
      },
    }));

    res.status(200).json({
      message: 'Lấy tin nhắn thành công',
      messages
    });
  } catch (error) {
    logger.error(`Get messages error: ${error.message}`);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách cuộc trò chuyện
exports.getConversations = async (req, res) => {
  try {
    const adminId = req.user.userId;

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, content, image_url, created_at, sender_id, receiver_id, sender_name, sender_avatar_url')
      .or(`sender_id.eq.${adminId},receiver_id.eq.${adminId}`)
      .order('created_at', { ascending: false });

    if (messagesError) {
      logger.error(`Supabase fetch conversations error: ${messagesError.message}`);
      throw new Error(messagesError.message);
    }

    const userIds = new Set(messages.map((msg) =>
      msg.sender_id === adminId ? msg.receiver_id : msg.sender_id
    ));

    const users = await Promise.all(
      Array.from(userIds).map(async (userId) => {
        try {
          const user = await User.findById(userId);
          if (!user || !['user', 'customer'].includes(user.role)) {
            return null;
          }

          const { data: latestMessage, error: messageError } = await supabase
            .from('messages')
            .select('id, content, image_url, created_at, sender_id, receiver_id, sender_name, sender_avatar_url')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .or(`sender_id.eq.${adminId},receiver_id.eq.${adminId}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (messageError) {
            logger.error(`Supabase fetch latest message error: ${messageError.message}`);
            throw new Error(messageError.message);
          }

          return {
            _id: user._id.toString(),
            name: user.name,
            avatar_url: user.avatar_url || '',
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
                    name: latestMessage.sender_name || user.name,
                    avatar: latestMessage.sender_avatar_url || user.avatar_url || ''
                  }
                }
              : undefined
          };
        } catch (error) {
          logger.error(`Lỗi khi lấy dữ liệu cho user ${userId}: ${error.message}`);
          return null;
        }
      })
    );

    const filteredUsers = users.filter(user => user !== null);

    res.status(200).json({ message: 'Lấy danh sách cuộc trò chuyện thành công', data: filteredUsers });
  } catch (error) {
    logger.error(`Get conversations error: ${error.message}`);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};