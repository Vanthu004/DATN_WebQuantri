const User = require('../models/User');
const EmailVerificationToken = require('../models/EmailVerificationToken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// Cấu hình multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
  },
});
exports.uploadAvatar = upload.single('avata_url');

// Gửi email xác nhận OTP
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const sendVerificationEmail = async (email, otp) => {
  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: `"Swear Support" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: 'Mã xác nhận đăng ký tài khoản',
    html: `<div style="font-family: Arial, sans-serif;">
      <h2>Xác nhận đăng ký tài khoản</h2>
      <p>Nhập mã OTP sau để xác nhận: <strong>${otp}</strong></p>
      <p>Mã sẽ hết hạn sau 10 phút.</p>
    </div>`,
  });
};

// Đăng ký
exports.createUser = async (req, res) => {
  try {
    const { email, password, password_confirm, name, role, phone_number, address, avatar, avata_url } = req.body;

    if (password !== password_confirm) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email đã được sử dụng" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      phone_number,
      address,
      avatar: avatar || null,
      avata_url: avata_url || "",
      email_verified: false,
      email_verification_otp: otp,
      email_verification_expires: new Date(Date.now() + 10 * 60 * 1000)
    });
    await user.save();
    await EmailVerificationToken.create({ email, otp });

    try {
      await sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error('❌ Lỗi gửi email xác nhận:', emailError);
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(201).json({
      message: 'Tạo user thành công. Vui lòng kiểm tra email để xác nhận.',
      user: { ...user._doc, password: undefined },
      token,
      emailSent: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("avatar");
    if (!user) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });

    if (user.is_blocked) return res.status(403).json({ message: "Tài khoản đã bị chặn" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });

    if (!user.email_verified) {
      return res.status(401).json({
        message: 'Vui lòng xác nhận email trước khi đăng nhập',
        emailNotVerified: true
      });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      user: { ...user._doc, password: undefined },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy tất cả users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").populate("avatar");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy user theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("avatar");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật user cho admin
exports.updateUser = async (req, res) => {
  try {
    const { password, avatar, avata_url, ...updateData } = req.body;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { ...updateData, avatar: avatar || null, avata_url: avata_url || "" } },
      { new: true, runValidators: true }
    ).select("-password").populate("avatar");

    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    res.status(200).json({ message: "Cập nhật user thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone_number, email, gender, address } = req.body;

    if (!name || !email) return res.status(400).json({ message: 'Vui lòng nhập họ tên và email' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Email không đúng định dạng' });

    if (phone_number) {
      const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(phone_number)) return res.status(400).json({ message: 'Số điện thoại không đúng định dạng' });
    }

    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail) return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác' });

    if (phone_number) {
      const existingPhone = await User.findOne({ phone_number, _id: { $ne: userId } });
      if (existingPhone) return res.status(400).json({ message: 'Số điện thoại đã được sử dụng bởi tài khoản khác' });
    }

    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      address: address ? address.trim() : ''
    };

    if (phone_number) updateData.phone_number = phone_number.trim();
    if (gender) updateData.gender = gender;

    if (req.file) {
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      updateData.avata_url = base64Image;
    }

    const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    res.status(200).json({ message: 'Cập nhật thông tin cá nhân thành công', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Vui lòng nhập đầy đủ' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải từ 6 ký tự' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return res.status(400).json({ message: 'Mật khẩu mới không được trùng' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xoá user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json({ message: "Xóa user thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Chặn / mở chặn user
exports.blockUser = async (req, res) => {
  try {
    const { block } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { is_blocked: block },
      { new: true }
    ).select("-password").populate("avatar");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    res.status(200).json({ message: block ? "Đã chặn user" : "Đã mở chặn user", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy avatar user (base64)
exports.getAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('avata_url');
    if (!user || !user.avata_url) return res.status(404).json({ message: 'Không có avatar' });

    res.status(200).json({ avata_url: user.avata_url });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
