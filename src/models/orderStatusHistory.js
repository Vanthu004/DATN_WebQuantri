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
  update_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("OrderStatusHistory", orderStatusHistorySchema);
