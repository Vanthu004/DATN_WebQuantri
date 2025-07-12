const express = require("express");
const router = express.Router();
const ciCtrl = require("../controllers/cartItemController");

// Thêm sản phẩm vào giỏ

router.post("/", ciCtrl.addItem);

// Lấy tất cả item của một cart
router.get("/cart/:cartId", ciCtrl.getItemsByCart);

// Cập nhật số lượng
router.put("/:id", ciCtrl.updateQuantity);

// Xoá item
router.delete("/:id", ciCtrl.deleteItem);


module.exports = router;
