const OrderStatusHistory = require("../models/orderStatusHistory");

/* Tạo lịch sử trạng thái đơn hàng */
exports.createStatusHistory = async (req, res) => {
  try {
    const status = await OrderStatusHistory.create(req.body);
    res.status(201).json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả lịch sử trạng thái */
exports.getAllStatusHistory = async (_req, res) => {
  try {
    const list = await OrderStatusHistory.find()
      .populate("order_id", "_id")
      .populate("update_by", "name email");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy lịch sử theo order_id */
exports.getStatusHistoryByOrder = async (req, res) => {
  try {
    const history = await OrderStatusHistory.find({ order_id: req.params.orderId })
      .sort({ update_at: -1 })
      .populate("update_by", "name email");
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
