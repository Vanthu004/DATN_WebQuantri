const mongoose = require('mongoose');

const categoryTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('CategoryType', categoryTypeSchema); 