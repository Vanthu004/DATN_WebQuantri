// src/models/ChatRoom.js
const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    default: () => require('crypto').randomUUID()
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['product_inquiry', 'order_support', 'complaint', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    tags: [String],
    customerInfo: {
      phone: String,
      email: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
chatRoomSchema.index({ userId: 1, status: 1 });
chatRoomSchema.index({ assignedStaff: 1, status: 1 });
chatRoomSchema.index({ status: 1, priority: 1 });
chatRoomSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);