const express = require("express");
const router = express.Router();
const orderCtrl = require("../controllers/orderController");

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


module.exports = router;
