const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  ward: {
    type: String,
  },
  district: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: 'Việt Nam',
  },
  type: {
    type: String,
    enum: ['home', 'work', 'shipping', 'other'],
    default: 'home',
  },
  is_default: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);
