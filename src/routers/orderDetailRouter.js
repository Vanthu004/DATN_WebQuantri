const express = require("express");
const router = express.Router();
const controller = require("../controllers/orderDetailController");

// Tạo mới
router.post("/", controller.createOrderDetail);

// Lấy tất cả
router.get("/", controller.getAllOrderDetails);

// Lấy theo ID
router.get("/:id", controller.getOrderDetailById);

// Lấy theo order_id
router.get("/order/:orderId", controller.getByOrderId);

// Xoá
router.delete("/:id", controller.deleteOrderDetail);

module.exports = router;
