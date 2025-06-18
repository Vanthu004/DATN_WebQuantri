// src/models/productVariant.js
const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    variant_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant_name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock_quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    variant_type: {
      type: String, // ví dụ: 'size', 'color', 'material'
      trim: true,
    },
    variant_value: {
      type: String, // ví dụ: 'XL', 'Red'
      trim: true,
    },
    size: String,  // tùy chọn
    color: String, // tùy chọn
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductVariant", productVariantSchema);
