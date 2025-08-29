const express = require("express");
const router = express.Router();
const shipCtrl = require("../controllers/shippingMethodController");

router.post("/", shipCtrl.createShippingMethod);
router.get("/", shipCtrl.getAllShippingMethods);
router.get("/:id", shipCtrl.getShippingMethodById);
router.put("/:id", shipCtrl.updateShippingMethod);
router.delete("/:id", shipCtrl.deleteShippingMethod);

module.exports = router;