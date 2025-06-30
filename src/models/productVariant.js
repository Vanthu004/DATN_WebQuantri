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
    size: { type: String, required: true },
    color: { type: String, required: true }
  },
  image_url: {

    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Đảm bảo không trùng size + color cho 1 product
productVariantSchema.index(
  { product_id: 1, 'attributes.size': 1, 'attributes.color': 1 },
  { unique: true }
);

module.exports = mongoose.model('ProductVariant', productVariantSchema);
