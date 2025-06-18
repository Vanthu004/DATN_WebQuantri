const mongoose = require("mongoose");

const favoriteProductSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
}, { timestamps: true });

// Đảm bảo một user không thể thích 1 sản phẩm nhiều lần
favoriteProductSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model("FavoriteProduct", favoriteProductSchema);
