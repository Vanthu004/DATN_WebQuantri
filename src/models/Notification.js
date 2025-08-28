const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notification_id: {
    type: String,
    unique: true,
    default: () => 'NOTI-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sent_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
