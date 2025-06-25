const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'], // bạn có thể điều chỉnh vai trò khác nếu cần
    default: 'user'
  },
    phone_number: {
      type: String,
      trim: true,
      match: [/^[0-9+]{9,15}$/, 'Số điện thoại không hợp lệ'],
    },
  avata_url: {
    type: String,
    default: '',
    maxlength: 16777216 // Giới hạn 16MB cho Base64 string
  },
  address: {
    type: String,
    default: ''
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  token_device: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  birthdate: {
    type: Date
  },
  // Thêm trường cho xác nhận email
  email_verified: {
    type: Boolean,
    default: false
  },
  email_verification_otp: {
    type: String,
    default: null
  },
  email_verification_expires: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
