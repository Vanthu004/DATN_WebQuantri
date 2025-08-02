const ShippingMethod = require("../models/ShippingMethod");

/* Tạo phương thức vận chuyển mới */
exports.createShippingMethod = async (req, res) => {
  try {
    const newMethod = await ShippingMethod.create(req.body);
    res.status(201).json(newMethod);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả phương thức vận chuyển */
exports.getAllShippingMethods = async (_req, res) => {
  try {
    const list = await ShippingMethod.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy 1 phương thức theo ID */
exports.getShippingMethodById = async (req, res) => {
  try {
    const method = await ShippingMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ msg: "Không tìm thấy phương thức" });
    res.json(method);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Cập nhật */
exports.updateShippingMethod = async (req, res) => {
  try {
    const updated = await ShippingMethod.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updated) return res.status(404).json({ msg: "Không tìm thấy phương thức" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Xoá */
exports.deleteShippingMethod = async (req, res) => {
  try {
    const deleted = await ShippingMethod.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy phương thức" });
    res.json({ msg: "Đã xoá phương thức vận chuyển" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
