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

router.post('/zalopay/payment', paymentController.createZaloPayOrder);
router.post('/zalopay/check-status-order', paymentController.checkZaloPayOrderStatus);
router.post('/zalopay/check-status', paymentController.checkZaloPayOrderStatus); // Thêm route này để tương thích với FE
router.post('/zalopay/callback', paymentController.zaloPayCallback);

module.exports = router;