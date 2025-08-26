// src/routers/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Dữ liệu không hợp lệ', 
      errors: errors.array() 
    });
  }
  next();
};

// Chat Room Routes

// Tạo phòng chat mới (User only)
router.post('/rooms', [
  authMiddleware,
  body('subject').notEmpty().trim().withMessage('Chủ đề chat không được để trống'),
  body('category').optional().isIn([
    'product_inquiry',
    'order_support',
    'complaint',
    'general',
    'technical_support',
    'account_support'
  ]),
  validateRequest
], chatController.createChatRoom);

// Lấy phòng chat của user
router.get('/rooms/my-rooms', [
  authMiddleware,
  query('status').optional().isIn(['open', 'assigned', 'resolved', 'closed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest
], chatController.getMyChatRooms);

// Lấy phòng chat được gán (Staff)
router.get('/rooms/assigned', [
  authMiddleware,
  query('status').optional().isIn(['open', 'assigned', 'resolved', 'closed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest
], chatController.getAssignedChatRooms);

// Lấy tất cả phòng chat (Admin)
router.get('/rooms/all', [
  authMiddleware,
  query('status').optional().isIn(['open', 'assigned', 'resolved', 'closed']),
  query('category').optional().isIn([
    'product_inquiry',
    'order_support',
    'complaint',
    'general',
    'technical_support',
    'account_support'
  ]),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('assigned').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], chatController.getAllChatRooms);

// Lấy chi tiết phòng chat
router.get('/rooms/:roomId', [
  authMiddleware,
  param('roomId').isUUID().withMessage('roomId không hợp lệ'),
  validateRequest
], chatController.getChatRoomById);

// Gán staff cho phòng (Admin only)
router.put('/rooms/:roomId/assign', [
  authMiddleware,
  param('roomId').isUUID().withMessage('roomId không hợp lệ'),
  body('staffId').isMongoId().withMessage('staffId không hợp lệ'),
  validateRequest
], chatController.assignStaffToRoom);

// Cập nhật trạng thái phòng
router.put('/rooms/:roomId/status', [
  authMiddleware,
  param('roomId').isUUID().withMessage('roomId không hợp lệ'),
  body('status').isIn(['open', 'assigned', 'resolved', 'closed']).withMessage('Trạng thái không hợp lệ'),
  validateRequest
], chatController.updateRoomStatus);

// Message Routes

// Gửi tin nhắn
router.post('/messages', [
  authMiddleware,
  body('roomId').isUUID().withMessage('roomId không hợp lệ'),
  body('content').notEmpty().trim().withMessage('Nội dung tin nhắn không được để trống'),
  body('type').optional().isIn(['text', 'image']),
  validateRequest
], chatController.sendMessage);

// Lấy tin nhắn trong phòng
router.get('/rooms/:roomId/messages', [
  authMiddleware,
  param('roomId').isUUID().withMessage('roomId không hợp lệ'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], chatController.getMessages);

// Statistics Routes (Admin only)
router.get('/statistics', [
  authMiddleware,
  query('period').optional().isIn(['7d', '30d']),
  validateRequest
], chatController.getChatStatistics);

module.exports = router;
