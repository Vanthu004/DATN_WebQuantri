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
  }
});

module.exports = mongoose.model("CartItem", cartItemSchema);
