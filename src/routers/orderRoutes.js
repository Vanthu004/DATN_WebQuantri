// src/routers/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderCtrl = require("../controllers/orderController");
const Order = require("../models/Order"); 

// Tạo đơn
router.post("/", orderCtrl.createOrder);

// Lấy tất cả
router.get("/", orderCtrl.getAllOrders);

// Chi tiết
router.get("/:id", orderCtrl.getOrderById);

// Đơn của user
router.get("/user/:userId", orderCtrl.getOrdersByUser);

// Cập nhật
router.put("/:id", orderCtrl.updateOrder);

// Xoá
router.delete("/:id", orderCtrl.deleteOrder);

// API tạo order kèm order detail
router.post("/full", orderCtrl.createOrderWithDetails);

// API hủy đơn
router.put("/:id/cancel", orderCtrl.cancelOrder);

// API cập nhật trạng thái thanh toán khi thanh toán online thành công
router.post("/update-payment-status", orderCtrl.updatePaymentStatusForOnlinePayment);

// API cập nhật trạng thái thanh toán cho đơn hàng COD
router.put("/:order_id/update-cod-payment", orderCtrl.updatePaymentStatusForCOD);

// API để người dùng xác nhận đã nhận hàng
router.put("/:order_id/confirm-received", orderCtrl.confirmOrderReceived);

// Test endpoint để debug
router.get("/test-confirm/:order_id", (req, res) => {
  res.json({
    success: true,
    msg: "Test endpoint working",
    order_id: req.params.order_id,
    method: req.method,
    url: req.url
  });
});

module.exports = router;
