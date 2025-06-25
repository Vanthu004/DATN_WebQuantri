const User = require("../models/user");
const EmailVerificationToken = require("../models/EmailVerificationToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
// Hàm tạo transporter email
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};
// Cấu hình multer cho upload file
const storage = multer.memoryStorage(); // Lưu ảnh vào memory buffer

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép upload file ảnh!"), false);
    }
  },
});
// Hàm gửi email xác nhận OTP
const sendVerificationEmail = async (email, otp) => {
  const transporter = createEmailTransporter();

  await transporter.sendMail({
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
  });
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

// Lấy user theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("avatar");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Tạo user mới
exports.createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      password_confirm,
      role,
      phone_number,
      address,
      avatar,
      avata_url,
    } = req.body;
    // Kiểm tra password_confirm
    if (password !== password_confirm) {
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
    try {
      await sendVerificationEmail(email, verificationOtp);
    } catch (emailError) {
      console.error("❌ Lỗi gửi email xác nhận:", emailError);
      // Vẫn tạo user thành công nhưng thông báo lỗi email
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
    res.status(201).json({
      message: "Tạo user thành công",
      user: populated,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone_number, email, gender, address } = req.body;

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

    // Xử lý upload ảnh
    if (req.file) {
      // Kiểm tra kích thước file (5MB)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          message: "File ảnh không được lớn hơn 5MB",
        });
      }

      // Kiểm tra định dạng file
      const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: "Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF)",
        });
      }

      // Chuyển đổi ảnh thành Base64
      const base64Image = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;
      updateData.avata_url = base64Image;
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

// Xóa user
// Chặn hoặc mở chặn user
exports.blockUser = async (req, res) => {
  try {
    const { block } = req.body; // true: chặn, false: mở chặn
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { is_blocked: block },
      { new: true }
    )
      .select("-password")
      .populate("avatar");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    res
      .status(200)
      .json({ message: block ? "Đã chặn user" : "Đã mở chặn user", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
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
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    if (user.is_blocked) {
      return res.status(403).json({
        message: "Tài khoản đã bị chặn. Vui lòng liên hệ quản trị viên.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
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

// Middleware để xử lý upload file
exports.uploadAvatar = upload.single("avata_url");
