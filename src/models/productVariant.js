const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  stock_quantity: {
    type: Number,
    default: 0
  },
  attributes: {
    size: { type: mongoose.Schema.Types.ObjectId, ref: 'Size', required: true },
    color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: true }
  },
  image_url: {
    type: String,
    default: ''
  },
  // Thêm trường để tối ưu cho Frontend
  is_active: {
    type: Boolean,
    default: true
  },
  sort_order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field để lấy thông tin size và color
productVariantSchema.virtual('size_name').get(function() {
  return this.attributes?.size?.name || '';
});

productVariantSchema.virtual('color_name').get(function() {
  return this.attributes?.color?.name || '';
});

// Virtual field để tạo key duy nhất
productVariantSchema.virtual('variant_key').get(function() {
  return `${this.attributes?.size?._id || ''}-${this.attributes?.color?._id || ''}`;
});

// Virtual field để kiểm tra còn hàng không
productVariantSchema.virtual('in_stock').get(function() {
  return this.stock_quantity > 0 && this.is_active;
});

// Pre-save middleware để validate
productVariantSchema.pre('save', function(next) {
  // Kiểm tra giá phải dương
  if (this.price <= 0) {
    return next(new Error('Price must be greater than 0'));
  }
  
  // Kiểm tra stock không âm
  if (this.stock_quantity < 0) {
    return next(new Error('Stock quantity cannot be negative'));
  }
  
  next();
});

// Đảm bảo không trùng size + color cho 1 product
productVariantSchema.index(
  { product_id: 1, 'attributes.size': 1, 'attributes.color': 1 },
  { unique: true }
);

// Index để tối ưu query
productVariantSchema.index({ product_id: 1, is_active: 1 });
productVariantSchema.index({ price: 1 });

module.exports = mongoose.model('ProductVariant', productVariantSchema);
