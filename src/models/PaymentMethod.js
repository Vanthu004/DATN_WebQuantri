const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  discription: {                // (giữ nguyên chính tả theo bản vẽ)
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, { timestamps: true });

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
