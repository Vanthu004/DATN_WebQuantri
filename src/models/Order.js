const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending",
  },
  total_price: {
    type: Number,
    required: true,
  },
  shipmethod_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShipMethod",
    required: true,
  },
  paymethod_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PayMethod",
    required: true,
  },
  is_paid: {
    type: Boolean,
    default: false,
  },
  shipping_address: {
    type: String,
    required: true,
  },
  payment_date: {
    type: Date,
  },
});

module.exports = mongoose.model("Order", orderSchema);
