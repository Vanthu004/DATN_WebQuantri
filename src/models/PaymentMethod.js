const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  discription: { type: String },
  status: { type: Boolean, default: true }
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
