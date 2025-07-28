const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
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

const Size = mongoose.model('Size', sizeSchema);

module.exports = Size;