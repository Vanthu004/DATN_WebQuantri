const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  voucher_id: {
    type: String,
    required: false,
    default: () => 'VOUCHER-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  },
  User_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
    title: {
    type: String,
    required: false,
  },
  discount_value: {
    type: Number,
    required: true,
  },
  usage_limit: {
    type: Number,
    required: true,
  },
  used_count: {
    type: Number,
    default: 0,
  },
  expiry_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);
