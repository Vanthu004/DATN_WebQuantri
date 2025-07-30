const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    payment_id: {
      type: String,
      required: true,
      unique: true,
    },
    order_id: {
      type: String,
      required: true,
    },
    payment_method: {
      type: String,
      enum: ["COD", "Banking","ZALOPAY"],
      required: true,
    },
    transaction_code: {
      type: String,
      default: null,
    },
    payment_status: {
      type: String,
      // enum: [
      //   "Chưa thanh toán",
      //   "Đã thanh toán",
      //   "Chờ hoàn tiền",
      //   "Đã hoàn tiền",
      // ],
      // default: "Chưa thanh toán",
      enum: ["pending", "success", "failed"], // Thêm "success" và "failed"
      default: "pending"
    },
    amount_paid: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
