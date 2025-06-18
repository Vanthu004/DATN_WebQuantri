const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/favoriteProductController");

// Thêm vào danh sách yêu thích
router.post("/api/favorites", ctrl.addFavorite);

// Lấy danh sách yêu thích của 1 user
router.get("/api/favorites/:userId", ctrl.getFavoritesByUser);

// Xoá sản phẩm yêu thích
router.delete("/api/favorites/:userId/:productId", ctrl.removeFavorite);

module.exports = router;
