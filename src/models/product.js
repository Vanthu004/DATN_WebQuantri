const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  stock_quantity: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category" // Nếu có category, không bắt buộc
  },
  image_url: {
    type: String,
    default: ""
  },
  sold_quantity: {
    type: Number,
    default: 0
  },
  created_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Product", productSchema);
