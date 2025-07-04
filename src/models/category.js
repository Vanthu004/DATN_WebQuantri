const mongoose = require("mongoose");
require("./uploadModel");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
    },
    image_url: String,
    sort_order: {
      type: Number,
      default: 0,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: ''
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
