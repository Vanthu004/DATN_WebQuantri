const mongoose = require("mongoose");

const shippingMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  discription: {
    type: String
  },
  fee: {
    type: Number,
    required: true
  },
  estimated_days: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
});

module.exports = mongoose.model("ShippingMethod", shippingMethodSchema);
