const express = require("express");
const router = express.Router();
const shipCtrl = require("../controllers/shippingMethodController");

router.post("/api/shipping-method", shipCtrl.createShippingMethod);
router.get("/api/shipping-method", shipCtrl.getAllShippingMethods);
router.get("/api/shipping-method/:id", shipCtrl.getShippingMethodById);
router.put("/api/shipping-method/:id", shipCtrl.updateShippingMethod);
router.delete("/api/shipping-method/:id", shipCtrl.deleteShippingMethod);

module.exports = router;
