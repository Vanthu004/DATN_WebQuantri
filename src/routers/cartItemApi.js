const express = require("express");
const router = express.Router();
const ciCtrl = require("../controllers/cartItemController");

// Thêm sản phẩm vào giỏ
router.post("/api/cart-items", ciCtrl.addItem);

// Lấy tất cả item của một cart
router.get("/api/cart-items/cart/:cartId", ciCtrl.getItemsByCart);

// Cập nhật số lượng
router.put("/api/cart-items/:id", ciCtrl.updateQuantity);

// Xoá item
router.delete("/api/cart-items/:id", ciCtrl.deleteItem);

module.exports = router;
