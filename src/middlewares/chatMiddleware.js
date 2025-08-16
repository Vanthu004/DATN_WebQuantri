// src/middlewares/chatMiddleware.js
const ChatRoom = require('../models/ChatRoom');

// Middleware kiểm tra quyền truy cập phòng chat
const checkChatRoomAccess = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const chatRoom = await ChatRoom.findOne({ roomId, isActive: true });
    
    if (!chatRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chat' });
    }

    // Check access permission
    const hasAccess = 
      userRole === 'admin' ||
      chatRoom.userId.toString() === userId ||
      (chatRoom.assignedStaff && chatRoom.assignedStaff.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Không có quyền truy cập phòng chat này' });
    }

    req.chatRoom = chatRoom;
    next();
  } catch (error) {
    console.error('Check chat room access error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Middleware kiểm tra role staff/admin
const requireStaffRole = (req, res, next) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Chỉ admin và staff mới có quyền thực hiện thao tác này' 
    });
  }
  next();
};

// Middleware kiểm tra role admin
const requireAdminRole = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Chỉ admin mới có quyền thực hiện thao tác này' 
    });
  }
  next();
};

module.exports = {
  checkChatRoomAccess,
  requireStaffRole,
  requireAdminRole
};