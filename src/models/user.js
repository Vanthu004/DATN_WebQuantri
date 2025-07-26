const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "customer", "user"],
      default: "customer",
    },
    phone_number: {
      type: String,
      required: false,
    },
    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
    },
    avata_url: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    token_device: {
      type: String,
      default: "",
    },
    ban: {
      isBanned: {
        type: Boolean,
        default: false,
      },
      bannedUntil: {
        type: Date,
        default: null, // null = ban vĩnh viễn hoặc không bị ban
      },
      reason: {
        type: String,
        default: "",
      },
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
  },

  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
