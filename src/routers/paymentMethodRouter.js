const express = require("express");
const router = express.Router();
const pmCtrl = require("../controllers/paymentMethodController");

// Tạo mới
router.post("/", pmCtrl.createPaymentMethod);

// Lấy tất cả
router.get("/", pmCtrl.getAllPaymentMethods);

// Theo ID
router.get("/:id", pmCtrl.getPaymentMethodById);

// Cập nhật
router.put("/:id", pmCtrl.updatePaymentMethod);

// Xoá
router.delete("/:id", pmCtrl.deletePaymentMethod);

module.exports = router;