const express = require("express");
const router = express.Router();
const pmCtrl = require("../controllers/paymentMethodController");

// Tạo mới
router.post("/api/payment-methods", pmCtrl.createPaymentMethod);

// Lấy tất cả
router.get("/api/payment-methods", pmCtrl.getAllPaymentMethods);

// Theo ID
router.get("/api/payment-methods/:id", pmCtrl.getPaymentMethodById);

// Cập nhật
router.put("/api/payment-methods/:id", pmCtrl.updatePaymentMethod);

// Xoá
router.delete("/api/payment-methods/:id", pmCtrl.deletePaymentMethod);

module.exports = router;
