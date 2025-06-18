const express = require("express");
const router = express.Router();
const cartCtrl = require("../controllers/cartController");

// Tạo giỏ hàng
router.post("/api/carts", cartCtrl.createCart);

// Lấy tất cả giỏ hàng
router.get("/api/carts", cartCtrl.getAllCarts);

// Lấy giỏ hàng theo ID
router.get("/api/carts/:id", cartCtrl.getCartById);

// Lấy giỏ hàng theo user_id
router.get("/api/carts/user/:userId", cartCtrl.getCartByUser);

// Xoá giỏ hàng
router.delete("/api/carts/:id", cartCtrl.deleteCart);

module.exports = router;
