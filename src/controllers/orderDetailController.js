const OrderDetail = require("../models/orderDetail");

/* Thêm chi tiết đơn hàng */
exports.createOrderDetail = async (req, res) => {
  try {
    const detail = await OrderDetail.create(req.body);
    res.status(201).json(detail);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả chi tiết đơn hàng */
exports.getAllOrderDetails = async (_req, res) => {
  try {
    const list = await OrderDetail.find()
      .populate("order_id", "order_id")
      .populate("variant_id", "variant_name");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy chi tiết theo ID */
exports.getOrderDetailById = async (req, res) => {
  try {
    const detail = await OrderDetail.findById(req.params.id);
    if (!detail) return res.status(404).json({ msg: "Không tìm thấy chi tiết" });
    res.json(detail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy tất cả chi tiết theo order_id */
exports.getByOrderId = async (req, res) => {
  try {
    const list = await OrderDetail.find({ order_id: req.params.orderId });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Xoá chi tiết */
exports.deleteOrderDetail = async (req, res) => {
  try {
    const deleted = await OrderDetail.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy chi tiết" });
    res.json({ msg: "Đã xoá chi tiết đơn hàng" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
