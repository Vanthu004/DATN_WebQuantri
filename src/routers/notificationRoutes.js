const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.post('/save-token', notificationController.saveToken);
router.post('/send-notification', notificationController.sendNotification);
router.post('/send-bulk-notification', notificationController.sendBulkNotification);

module.exports = router;