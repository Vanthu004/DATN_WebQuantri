const mongoose = require("mongoose");

const orderStatusHistorySchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  status: {
    type: String,
    required: true
  },
  update_at: {
    type: Date,
    default: Date.now
  },
  update_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // nếu bạn lưu theo người dùng cập nhật trạng thái
    required: true
  }
});

module.exports = mongoose.model("OrderStatusHistory", orderStatusHistorySchema);
