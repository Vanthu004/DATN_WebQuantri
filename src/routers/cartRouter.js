const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// POST: Tạo giỏ hàng
router.post("/", cartController.createCart);

// POST: Thêm sản phẩm vào giỏ
router.post("/:cartId/items", cartController.addItemToCart);

// GET: Lấy sản phẩm theo cart
router.get("/:cartId/items", cartController.getCartItems);

module.exports = router;
