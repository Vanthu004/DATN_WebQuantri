const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Cart"
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product"
  },
  product_variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariant",
    default: null
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  // Thông tin sản phẩm tại thời điểm thêm vào giỏ
  price_at_time: {
    type: Number,
    required: true,
    min: 0
  },
  product_name: {
    type: String,
    required: true,
    trim: true
  },
  product_image: {
    type: String
  },
  // Thông tin biến thể (nếu có)
  variant_info: {
    size: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String
    },
    color: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String
    },
    sku: String
  },
  // Trạng thái item
  is_active: {
    type: Boolean,
    default: true
  },
  // Thời gian thêm vào giỏ
  added_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field để tính tổng tiền của item
cartItemSchema.virtual('total_price').get(function() {
  return this.price_at_time * this.quantity;
});

// Virtual field để lấy thông tin variant display
cartItemSchema.virtual('variant_display').get(function() {
  if (!this.variant_info) return null;
  const parts = [];
  if (this.variant_info.size?.name) parts.push(this.variant_info.size.name);
  if (this.variant_info.color?.name) parts.push(this.variant_info.color.name);
  return parts.length > 0 ? parts.join(' - ') : null;
});

// Index để tối ưu query
cartItemSchema.index({ cart_id: 1, product_id: 1, product_variant_id: 1 });
cartItemSchema.index({ cart_id: 1, is_active: 1 });

module.exports = mongoose.model("CartItem", cartItemSchema);
