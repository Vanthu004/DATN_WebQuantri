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
    ref: "Product" // ✅ Quan trọng: phải đúng tên đã register
  },
  quantity: {
    type: Number,
    required: true,
    default: 1

  },
  // Thêm thông tin sản phẩm tại thời điểm thêm vào giỏ
  price_at_time: {
    type: Number,
    required: true
  },
  product_name: {
    type: String,
    required: true,
    trim: true
  },
  product_image: {
    type: String

  }
});

module.exports = mongoose.model("CartItem", cartItemSchema);
