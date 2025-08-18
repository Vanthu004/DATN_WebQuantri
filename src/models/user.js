// src/models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"], 
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2, 
    },
    role: {
      type: String,

      enum: ["user", "staff", "admin", "customer"], 
      default: "user",
    },
    phone_number: {
      type: String,
      required: false,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"], 
    },
     avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
    },
    phone_number: {
      type: String,
      required: false,
    },
    birthdate: {
      type: Date
    },
    avatar_url: {
      type: String,
      default: "", 
    },
    address: {
      type: String,
      default: "",
      trim: true,
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
        default: null,
      },
      reason: {
        type: String,
        default: "",
        trim: true,
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    birthdate: {
      type: Date,
      required: false,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    email_verification_otp: {
      type: String,
      default: null,
      select: false, 
    },
    email_verification_expires: {
      type: Date,
      default: null,
    },

    supabase_user_id: {
      type: String,
      default: null, 
      index: true,
    },
    last_active: {
      type: Date,
      default: Date.now, 
    }
  },
  {
    timestamps: true, 
    indexes: [
      { key: { email: 1 }, unique: true },
      { key: { phone_number: 1 }, sparse: true }, 
      { key: { role: 1 } }, 
      { key: { supabase_user_id: 1 }, sparse: true }, 
    ],
  }
);

// Middleware để update timestamps
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);