const Address = require("../models/Address");
const User = require("../models/user");

// Lấy tất cả địa chỉ của user
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addresses = await Address.find({ user_id: userId }).sort({ is_default: -1, createdAt: -1 });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy địa chỉ theo ID
exports.getAddressById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.id;
    
    const address = await Address.findOne({ _id: addressId, user_id: userId });
    if (!address) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }
    
    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Tạo địa chỉ mới
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      phone,
      street,
      ward,
      district,
      province,
      country,
      type,
      is_default
    } = req.body;

    if (!name || !phone || !street || !district || !province) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin: người nhận, số điện thoại, đường/phố, quận/huyện, tỉnh/thành phố"
      });
    }

    // Validate type
    const validTypes = ["home", "office", "other"];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ message: "Loại địa chỉ không hợp lệ" });
    }

    const isDefaultBoolean = Boolean(is_default === true || is_default === "true");

    // Nếu là địa chỉ mặc định, bỏ mặc định các địa chỉ khác
    if (isDefaultBoolean) {
      await Address.updateMany({ user_id: userId }, { is_default: false });
    }

    // Tạo địa chỉ mới
    const address = new Address({
      user_id: userId,
      name,
      phone,
      street,
      ward,
      district,
      province,
      country: country || "Việt Nam",
      type: type || "home",
      is_default: isDefaultBoolean
    });

    await address.save();

    return res.status(201).json({
      message: "Tạo địa chỉ thành công",
      address
    });

  } catch (error) {
    console.error("Lỗi khi tạo địa chỉ:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Cập nhật địa chỉ
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.id;
    const { name, phone, street, ward, district, province, country, type, is_default } = req.body;

    const existingAddress = await Address.findOne({ _id: addressId, user_id: userId });
    if (!existingAddress) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    if (!name || !phone || !street || !district || !province) {
      return res.status(400).json({ 
        message: "Vui lòng nhập đầy đủ thông tin: người nhận, số điện thoại, đường/phố, quận/huyện, tỉnh/thành phố" 
      });
    }

    if (is_default) {
      await Address.updateMany(
        { user_id: userId, _id: { $ne: addressId } },
        { is_default: false }
      );
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        name,
        phone,
        street,
        ward,
        district,
        province,
        country: country || 'Việt Nam',
        type: type || 'home',
        is_default: is_default || false
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: "Cập nhật địa chỉ thành công", 
      address: updatedAddress 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


// Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.id;

    // Kiểm tra địa chỉ tồn tại và thuộc về user
    const address = await Address.findOne({ _id: addressId, user_id: userId });
    if (!address) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    // Nếu địa chỉ bị xóa là mặc định
    if (address.is_default) {
      const firstAddress = await Address.findOne({
        user_id: userId,
        _id: { $ne: addressId },
      }).sort({ createdAt: 1 });

      if (firstAddress) {
        await Address.findByIdAndUpdate(firstAddress._id, { is_default: true });
      }
    }

    // Thực hiện xóa
    const result = await Address.deleteOne({ _id: addressId, user_id: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Không thể xóa địa chỉ" });
    }

    res.status(200).json({ message: "Xóa địa chỉ thành công" });

  } catch (error) {
    console.error("Lỗi khi xóa địa chỉ:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


// Đặt địa chỉ làm mặc định
exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.id;

    // Kiểm tra địa chỉ tồn tại và thuộc về user
    const address = await Address.findOne({ _id: addressId, user_id: userId });
    if (!address) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    // Bỏ mặc định của tất cả địa chỉ khác
    await Address.updateMany(
      { user_id: userId },
      { is_default: false }
    );

    // Đặt địa chỉ này làm mặc định
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      { is_default: true },
      { new: true }
    );

    res.status(200).json({ 
      message: "Đặt địa chỉ mặc định thành công", 
      address: updatedAddress 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy địa chỉ mặc định của user
exports.getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const defaultAddress = await Address.findOne({ 
      user_id: userId, 
      is_default: true 
    });

    if (!defaultAddress) {
      return res.status(404).json({ message: "Không có địa chỉ mặc định" });
    }

    res.status(200).json(defaultAddress);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
}; 