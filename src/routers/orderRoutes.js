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





module.exports = router;
