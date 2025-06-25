const Order = require("../models/order");

/* Tạo đơn hàng mới */
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả đơn hàng */
exports.getAllOrders = async (_req, res) => {
  try {
    const list = await Order.find()
      .populate("user_id", "name email")
      .populate("shipmethod_id", "name")
      .populate("paymethod_id", "name");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy đơn hàng theo ID */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id", "name email")
      .populate("shipmethod_id", "name")
      .populate("paymethod_id", "name");
    if (!order) return res.status(404).json({ msg: "Không tìm thấy đơn hàng" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy đơn hàng của 1 user */
exports.getOrdersByUser = async (req, res) => {
  try {
    const list = await Order.find({ user_id: req.params.userId });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Cập nhật đơn hàng */
exports.updateOrder = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ msg: "Không tìm thấy đơn" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Xoá đơn hàng */
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy đơn" });
    res.json({ msg: "Đã xoá đơn hàng" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
