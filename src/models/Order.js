const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Chờ xử lý",
        "Đã xác nhận",
        "Đang vận chuyển",
        "Đã giao hàng",
        "Hoàn thành",
        "Đã hủy",
      ],
      default: "Chờ xử lý",
    },
    total_price: {
      type: Number,
      required: true,
    },
    shippingmethod_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingMethod",
      required: true,
    },
    paymentmethod_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
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
    order_code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
