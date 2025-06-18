const PaymentMethod = require("../models/paymentMethod");

/* Tạo phương thức thanh toán */
exports.createPaymentMethod = async (req, res) => {
  try {
    const method = await PaymentMethod.create(req.body);
    res.status(201).json(method);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả phương thức thanh toán */
exports.getAllPaymentMethods = async (_req, res) => {
  try {
    const list = await PaymentMethod.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy phương thức theo ID */
exports.getPaymentMethodById = async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ msg: "Không tìm thấy phương thức" });
    res.json(method);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Cập nhật phương thức */
exports.updatePaymentMethod = async (req, res) => {
  try {
    const updated = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Không tìm thấy phương thức" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Xoá phương thức */
exports.deletePaymentMethod = async (req, res) => {
  try {
    const deleted = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy phương thức" });
    res.json({ msg: "Đã xoá phương thức thanh toán" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
