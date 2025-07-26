const express = require("express");
const router = express.Router();
const refundController = require("../controllers/refundRequestController");

router.post("/", refundController.createRefundRequest);
router.get("/", refundController.getAllRefundRequests);
router.get("/:id", refundController.getRefundRequestById);

module.exports = router;
