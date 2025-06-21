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
    enum: ['admin','customer', 'user',], // bạn có thể điều chỉnh vai trò khác nếu cần
    default: 'user'
  },
  phone_number: {
    type: String,
    required: false
  },
  avata_url: {
    type: String,
    default: ''
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
  } 
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
