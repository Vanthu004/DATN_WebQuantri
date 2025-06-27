const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    stock_quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock"],
      default: "active",
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
    },
  ],
  default: [],
  image_url: {
    type: String,
    default: "",
  },
  sold_quantity: {
    type: Number,
    default: 0,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
    created_date: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
