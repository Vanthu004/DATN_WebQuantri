// src/api/productVariantApi.js
const express = require("express");
const router = express.Router();
const pvCtrl = require("../controllers/productVariantController");

// Tạo mới
router.post("/api/variants", pvCtrl.createVariant);

// Lấy tất cả
router.get("/api/variants", pvCtrl.getAllVariants);

// Theo ID
router.get("/api/variants/:id", pvCtrl.getVariantById);

// Theo sản phẩm
router.get("/api/variants/product/:productId", pvCtrl.getVariantsByProduct);

// Cập nhật
router.put("/api/variants/:id", pvCtrl.updateVariant);

// Xoá
router.delete("/api/variants/:id", pvCtrl.deleteVariant);

module.exports = router;
