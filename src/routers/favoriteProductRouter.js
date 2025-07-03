const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/favoriteProductController");

// Thêm vào danh sách yêu thích
router.post("/", ctrl.addFavorite);

// Lấy danh sách yêu thích của 1 user
router.get("/:userId", ctrl.getFavoritesByUser);

// Xoá sản phẩm yêu thích
router.delete("/:userId/:productId", ctrl.removeFavorite);

module.exports = router;
