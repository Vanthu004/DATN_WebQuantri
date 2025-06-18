const ShippingMethod = require('../models/ShippingMethod');

// Tạo mới phương thức giao hàng
exports.createShippingMethod = async (req, res) => {
  try {
    const newShipping = new ShippingMethod(req.body);
    await newShipping.save();
    res.status(201).json({ message: 'Thêm phương thức giao hàng thành công', data: newShipping });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tất cả phương thức giao hàng
exports.getAllShippingMethods = async (req, res) => {
  try {
    const methods = await ShippingMethod.find();
    res.json(methods); // Xem được trong trình duyệt
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy 1 phương thức theo ID
exports.getShippingMethodById = async (req, res) => {
  try {
    const method = await ShippingMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ message: 'Không tìm thấy phương thức' });
    res.json(method);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật
exports.updateShippingMethod = async (req, res) => {
  try {
    const updated = await ShippingMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy phương thức' });
    res.json({ message: 'Cập nhật thành công', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa
exports.deleteShippingMethod = async (req, res) => {
  try {
    const deleted = await ShippingMethod.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy phương thức' });
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
