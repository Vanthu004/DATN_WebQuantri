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
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "customer", "user"],
      default: "user",
    },
    phone_number: {
      type: String,
      required: false,
      trim: true,
    },
    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
      required: false,
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
    },
    email_verification_expires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    indexes: [
      { key: { email: 1 }, unique: true },
      { key: { phone_number: 1 }, sparse: true },
    ],
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);