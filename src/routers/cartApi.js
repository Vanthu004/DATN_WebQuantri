const express = require("express");
const router = express.Router();
const cartCtrl = require("../controllers/cartController");

// Tạo giỏ hàng
router.post("/", cartCtrl.createCart);

// Lấy tất cả giỏ hàng
router.get("/", cartCtrl.getAllCarts);

// Lấy giỏ hàng theo ID
router.get("/:id", cartCtrl.getCartById);

// Lấy giỏ hàng theo user_id
router.get("/user/:userId", cartCtrl.getCartByUser);

// Tạo đơn hàng từ giỏ hàng
router.post("/:id/checkout", cartCtrl.createOrderFromCart);

// Xoá giỏ hàng
router.delete("/:id", cartCtrl.deleteCart);

module.exports = router;
