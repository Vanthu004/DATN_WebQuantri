// src/api/productApi.js
const express = require("express");
const router = express.Router();
const prodCtrl = require("../controllers/productController");

// Tạo sản phẩm
router.post("/api/products", prodCtrl.createProduct);

// Lấy tất cả
router.get("/api/products", prodCtrl.getAllProducts);

// Theo ID
router.get("/api/products/:id", prodCtrl.getProductById);

// Theo danh mục
router.get("/api/products/category/:categoryId", prodCtrl.getProductsByCategory);

// Cập nhật
router.put("/api/products/:id", prodCtrl.updateProduct);

// Xoá
router.delete("/api/products/:id", prodCtrl.deleteProduct);

module.exports = router;
