const PaymentMethod = require('../models/PaymentMethod');

// Tạo mới phương thức thanh toán
exports.createPaymentMethod = async (req, res) => {
  try {
    const newPayment = new PaymentMethod(req.body);
    await newPayment.save();
    res.status(201).json({ message: 'Thêm phương thức thanh toán thành công', data: newPayment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tất cả phương thức thanh toán
exports.getAllPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find();
    res.json(methods); // Xem được trong trình duyệt
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy 1 phương thức theo ID
exports.getPaymentMethodById = async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ message: 'Không tìm thấy phương thức' });
    res.json(method);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật
exports.updatePaymentMethod = async (req, res) => {
  try {
    const updated = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy phương thức' });
    res.json({ message: 'Cập nhật thành công', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa
exports.deletePaymentMethod = async (req, res) => {
  try {
    const deleted = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy phương thức' });
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
