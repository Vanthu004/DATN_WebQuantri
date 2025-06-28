const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  expireAt: { 
    type: Date, 
    default: () => Date.now() + 10 * 60 * 1000 // hết hạn sau 10 phút
  },
});

emailVerificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailVerificationToken', emailVerificationSchema); 