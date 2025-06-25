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
    is_blocked: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
