const express = require("express");
const router = express.Router();
const statusCtrl = require("../controllers/orderStatusHistoryController");

router.post("/api/order-status", statusCtrl.createStatusHistory);
router.get("/api/order-status", statusCtrl.getAllStatusHistory);
router.get("/api/order-status/:orderId", statusCtrl.getStatusHistoryByOrder);

module.exports = router;
