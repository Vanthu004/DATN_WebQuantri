// models/Address.js

const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
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
    default: "Việt Nam",
  },
  type: {
    type: String,
    enum: ["home", "office", "other"],
    default: "home",
  },
  is_default: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model("Address", AddressSchema);
