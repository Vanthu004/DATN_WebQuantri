const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    product_variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      default: null
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price_each: {
      type: Number,
      required: true,
      min: 0
    },
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    product_price: {
      type: Number,
      required: true,
      min: 0
    },
    product_image: { 
      type: String,
      trim: true
    },
    // Thông tin biến thể (lưu trực tiếp để tránh populate)
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
    status: {
      type: String,
      enum: ["active", "cancelled", "returned"],
      default: "active"
    }
  },
  { 
    versionKey: false, 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field để tính tổng tiền của item
orderDetailSchema.virtual('total_price').get(function() {
  return this.price_each * this.quantity;
});

// Virtual field để hiển thị thông tin variant
orderDetailSchema.virtual('variant_display').get(function() {
  if (!this.variant_info) return null;
  const parts = [];
  if (this.variant_info.size?.name) parts.push(this.variant_info.size.name);
  if (this.variant_info.color?.name) parts.push(this.variant_info.color.name);
  return parts.length > 0 ? parts.join(' - ') : null;
});

// Virtual field để kiểm tra có biến thể không
orderDetailSchema.virtual('has_variant').get(function() {
  return !!this.product_variant_id || !!this.variant_info;
});

// Index để tối ưu query
orderDetailSchema.index({ order_id: 1 });
orderDetailSchema.index({ product_id: 1 });
orderDetailSchema.index({ product_variant_id: 1 });
orderDetailSchema.index({ status: 1 });

module.exports = mongoose.model("OrderDetail", orderDetailSchema);
