const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    trim: true,
    unique: true
  },
  hex_code: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
},
    { timestamps: true }
);

const Color = mongoose.model('Color', colorSchema);

module.exports = Color;