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
      ref: "Category",
      required: true,
    },
    images: [
      {
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
    views: {
      type: Number,
      default: 0
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    // Thêm các trường để tối ưu cho Frontend
    has_variants: {
      type: Boolean,
      default: false,
    },
    min_price: {
      type: Number,
      default: 0,
    },
    max_price: {
      type: Number,
      default: 0,
    },
    total_variants: {
      type: Number,
      default: 0,
    },
    available_sizes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Size'
    }],
    available_colors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Color'
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field để tính tổng stock từ variants
productSchema.virtual('total_stock').get(function() {
  return this.stock_quantity;
});

// Virtual field để lấy ảnh chính
productSchema.virtual('main_image').get(function() {
  return this.image_url || (this.images && this.images.length > 0 ? this.images[0] : '');
});

// Index để tối ưu query
productSchema.index({ status: 1, is_deleted: 1 });
productSchema.index({ category_id: 1, status: 1 });
productSchema.index({ sold_quantity: -1 });
productSchema.index({ views: -1 });

module.exports = mongoose.model("Product", productSchema);
