const express = require("express");
const router = express.Router();
const statusCtrl = require("../controllers/orderStatusHistoryController");

router.post("/", statusCtrl.createStatusHistory);
router.get("/", statusCtrl.getAllStatusHistory);
router.get("/:orderId", statusCtrl.getStatusHistoryByOrder);

module.exports = router;
