const express = require("express");
const router = express.Router();
const catCtrl = require("../controllers/categoryController");

// Tạo danh mục
router.post("/api/categories", catCtrl.createCategory);

// Lấy tất cả
router.get("/api/categories", catCtrl.getAllCategories);

// Theo ID
router.get("/api/categories/:id", catCtrl.getCategoryById);

// Cập nhật
router.put("/api/categories/:id", catCtrl.updateCategory);

// Xoá
router.delete("/api/categories/:id", catCtrl.deleteCategory);

module.exports = router;
