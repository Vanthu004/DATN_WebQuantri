const Voucher = require("../models/Voucher");
const mongoose = require("mongoose");
const User = require("../models/user");

// Tạo voucher (1 bản ghi hoặc nhiều bản ghi voucher cá nhân)
// Nếu req.body có userIds: tạo voucher cá nhân cho từng userId
// Hàm tạo voucher mới (thêm)
const generateVoucherId = () => {
  return "VOUCHER-" + Math.random().toString(36).substring(2, 10).toUpperCase();
};

exports.createVoucher = async (req, res) => {
  try {
    const {
      title,
      discount_value,
      usage_limit,
      expiry_date,
      status = "active",
      isPersonal = false, // true: tạo voucher cá nhân cho tất cả user
    } = req.body;

    if (!title || !usage_limit || !expiry_date) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc." });
    }

    let finalDiscount = discount_value;

    if (title === "Miễn phí vận chuyển") {
      finalDiscount = 0;
    } else if (title === "Giảm giá sản phẩm") {
      if (!discount_value || discount_value <= 0) {
        return res.status(400).json({ error: "Giảm giá phải lớn hơn 0 cho loại Giảm giá sản phẩm." });
      }
    }

    if (isPersonal) {
      const users = await User.find({}, "_id");
      if (!users || users.length === 0) {
        return res
          .status(404)
          .json({ error: "Không tìm thấy user nào để tạo voucher cá nhân." });
      }

      const vouchers = await Promise.all(
        users.map((user) => {
          return new Voucher({
            voucher_id: generateVoucherId(),
            User_id: user._id,
            title,
            discount_value,
            usage_limit,
            expiry_date,
            status,
          }).save();
        }),
      );

      return res.status(201).json(vouchers);
    }

    // Nếu không phải cá nhân => tạo 1 bản voucher dùng chung
    const voucher = new Voucher({
      voucher_id: generateVoucherId(),
      title,
      discount_value,
      usage_limit,
      expiry_date,
      status,
    });

    const saved = await voucher.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Lỗi khi tạo voucher:", err);
    res
      .status(500)
      .json({ error: err.message || "Lỗi server khi tạo voucher." });
  }
};
// Lấy danh sách voucher theo userId (có thể rỗng => lấy cả dùng chung)
exports.getVouchersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const today = new Date();

    // Tạo điều kiện lọc voucher hợp lệ
    const baseConditions = {
      status: "active",
      expiry_date: { $gte: today },
      usage_limit: { $gt: 0 },
    };

    // Nếu userId có => lấy chung + của user đó
    const query = userId
      ? {
          ...baseConditions,
          $or: [{ User_id: null }, { User_id: userId }],
        }
      : {
          ...baseConditions,
          User_id: null,
        };

    const vouchers = await Voucher.find(query).populate(
      "User_id",
      "name email",
    );

    res.status(200).json(vouchers);
  } catch (err) {
    console.error("❌ Lỗi khi lấy voucher theo userId:", err);
    res
      .status(500)
      .json({ error: err.message || "Lỗi server khi lấy voucher." });
  }
};

// Lấy tất cả voucher (chưa gộp, trả về đầy đủ)
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().populate("User_id", "name email"); // chỉ lấy tên email user
    res.status(200).json(vouchers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật voucher theo voucher_id
exports.updateVoucherByVoucherId = async (req, res) => {
  try {
    const { voucher_id } = req.params;
    const updateData = req.body;

    if (!voucher_id) {
      return res.status(400).json({ error: "voucher_id không được để trống." });
    }

    // Không cho sửa voucher_id
    delete updateData.voucher_id;

    // Cập nhật tất cả voucher có voucher_id = voucher_id truyền vào
    const result = await Voucher.updateMany(
      { voucher_id: voucher_id },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy voucher nào với voucher_id này." });
    }

    res
      .status(200)
      .json({ message: `Đã cập nhật ${result.modifiedCount} voucher.` });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: err.message || "Lỗi server khi cập nhật voucher." });
  }
};

// Xóa voucher theo _id
exports.deleteVoucher = async (req, res) => {
  try {
    const deleted = await Voucher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Voucher not found" });
    res.status(200).json({ message: "Voucher deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa tất cả voucher theo voucher_id (dùng để xóa voucher cá nhân nhiều bản ghi)
exports.deleteVoucherByVoucherId = async (req, res) => {
  try {
    const { voucher_id } = req.params;
    const result = await Voucher.deleteMany({ voucher_id });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Voucher not found" });
    res
      .status(200)
      .json({ message: `Deleted ${result.deletedCount} vouchers` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Lấy voucher(s) theo voucher_id
exports.getVoucherByVoucherId = async (req, res) => {
  try {
    const { voucher_id } = req.params;
    if (!voucher_id) {
      return res.status(400).json({ error: "voucher_id không được để trống." });
    }

    // Tìm tất cả voucher có voucher_id truyền vào (có thể nhiều bản ghi nếu là voucher cá nhân)
    const vouchers = await Voucher.find({ voucher_id }).populate(
      "User_id",
      "name email",
    );

    if (!vouchers || vouchers.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy voucher với voucher_id này." });
    }

    // Trả về danh sách voucher tìm được (nếu muốn chỉ 1 bản đại diện có thể trả vouchers[0])
    res.status(200).json(vouchers);
  } catch (err) {
    console.error("❌ Lỗi khi lấy voucher theo voucher_id:", err);
    res
      .status(500)
      .json({ error: err.message || "Lỗi server khi lấy voucher." });
  }
};
// Áp dụng voucher cho đơn hàng (cá nhân + dùng chung)
exports.applyVoucherToOrder = async (req, res) => {
  try {
    const { voucherId, userId } = req.params;
    if (!voucherId) return res.status(400).json({ error: "voucher_id là bắt buộc." });

    const userObjectId = userId ? mongoose.Types.ObjectId(userId) : null;

    // Atomic update, chỉ giảm usage_limit 1 lần, dùng $inc và $gt để chắc chắn
    const query = {
      voucher_id: voucherId,
      usage_limit: { $gt: 0 },
      status: "active",
      expiry_date: { $gte: new Date() },
    };

    if (userObjectId) {
      query.User_id = userObjectId; // ưu tiên voucher cá nhân
    } else {
      query.User_id = null; // voucher dùng chung
    }

    const voucher = await Voucher.findOneAndUpdate(
      query,
      { $inc: { usage_limit: -1, used_count: 1 } },
      { new: true }
    );

    // Nếu không tìm thấy voucher cá nhân, thử voucher dùng chung
    if (!voucher && userObjectId) {
      const commonVoucher = await Voucher.findOneAndUpdate(
        { ...query, User_id: null },
        { $inc: { usage_limit: -1, used_count: 1 } },
        { new: true }
      );
      if (!commonVoucher) return res.status(400).json({ error: "Voucher không hợp lệ hoặc đã hết lượt." });
      return res.status(200).json({ message: "Áp dụng voucher thành công", voucher: commonVoucher });
    }

    if (!voucher) return res.status(400).json({ error: "Voucher không hợp lệ hoặc đã hết lượt." });

    res.status(200).json({ message: "Áp dụng voucher thành công", voucher });
  } catch (err) {
    console.error("❌ applyVoucherToOrder error:", err);
    res.status(500).json({ error: "Lỗi server khi áp dụng voucher" });
  }
};




