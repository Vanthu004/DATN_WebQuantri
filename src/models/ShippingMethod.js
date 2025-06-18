const mongoose = require('mongoose');

const shippingMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  discription: { type: String },
  fee: { type: Number, required: true },
  estimated_days: { type: Number },
  status: { type: Boolean, default: true }
});

module.exports = mongoose.model('ShippingMethod', shippingMethodSchema);
