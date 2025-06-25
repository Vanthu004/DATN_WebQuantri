const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
      name,
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
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      phone_number,
      address,
      avatar: avatar || null,
      avata_url: avata_url || "",
    });
    await user.save();
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
