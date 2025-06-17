const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
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
    enum: ["COD", "Banking", "CreditCard", "Paypal"], // có thể tùy biến
    required: true,
  },
  transaction_code: {
    type: String,
    default: null,
  },
  payment_status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  amount_paid: {
    type: Number,
    required: true,
  },
  payment_date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
