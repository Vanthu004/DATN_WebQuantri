const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Tạo payment mới
router.post("/payments", paymentController.createPayment);

// Lấy tất cả payment
router.get("/payments", paymentController.getPayments);

// Lấy payment theo payment_id
router.get("/payments/:payment_id", paymentController.getPaymentById);

// Cập nhật payment
router.put("/payments/:payment_id", paymentController.updatePayment);

// Xóa payment
router.delete("/payments/:payment_id", paymentController.deletePayment);

module.exports = router;