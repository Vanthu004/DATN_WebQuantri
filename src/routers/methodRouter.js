const express = require('express');
const router = express.Router();

const shippingController = require('../controllers/shippingController');
const paymentController = require('../controllers/paymentController');

// ===== SHIPPING METHODS =====
router.post('/shipping', shippingController.createShippingMethod);
router.get('/shipping', shippingController.getAllShippingMethods);
router.get('/shipping/:id', shippingController.getShippingMethodById);  // Xem chi tiết
router.put('/shipping/:id', shippingController.updateShippingMethod);
router.delete('/shipping/:id', shippingController.deleteShippingMethod);

// ===== PAYMENT METHODS =====
router.post('/payment', paymentController.createPaymentMethod);
router.get('/payment', paymentController.getAllPaymentMethods);
router.get('/payment/:id', paymentController.getPaymentMethodById);  // Xem chi tiết
router.put('/payment/:id', paymentController.updatePaymentMethod);
router.delete('/payment/:id', paymentController.deletePaymentMethod);

// ===== DEFAULT TEST ROUTE =====
router.get('/', (req, res) => {
  res.send('🎉 API phương thức (Shipping & Payment) đang hoạt động!');
});

module.exports = router;
