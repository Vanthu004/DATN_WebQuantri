// src/controllers/chatController.js
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/user');
const { supabase } = require('../config/supabase');
const mongoose = require('mongoose');

// Tạo phòng chat mới (User only)
exports.createChatRoom = async (req, res) => {
  try {
    const { subject, category = 'general', priority = 'medium', metadata = {} } = req.body;
    const userId = req.user.userId;

    // Kiểm tra thông tin đầu vào
    if (!subject?.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập chủ đề chat' });
    }
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Mức độ ưu tiên không hợp lệ' });
    }

    

    const chatRoom = new ChatRoom({
      userId,
      subject: subject.trim(),
      category,
      priority, // Thêm priority
      metadata
    });

    await chatRoom.save();
    await chatRoom.populate('userId', 'name email phone_number avatar_url');

    console.log(' @Backend created room:', { message: 'Tạo phòng chat thành công', chatRoom });

    res.status(201).json({
      message: 'Tạo phòng chat thành công',
      chatRoom
    });
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách phòng chat của user
exports.getMyChatRooms = async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;

    const query = { userId, isActive: true };
    if (status && ['open', 'assigned', 'resolved', 'closed'].includes(status)) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const chatRooms = await ChatRoom.find(query)
      .populate('assignedStaff', 'name avatar_url role')
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ChatRoom.countDocuments(query);
    console.log('Backend getMyChatRooms:', {
      userId,
      query,
      chatRooms: chatRooms.map(r => ({ roomId: r.roomId, status: r.status, updatedAt: r.updatedAt })),
      total
    });

    res.json({
      chatRooms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasMore: skip + chatRooms.length < total
      }
    });
  } catch (error) {
    console.error('Get my chat rooms error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy phòng chat được gán (Staff)
exports.getAssignedChatRooms = async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const staffId = req.user.userId;

    const query = {
      assignedStaff: staffId,
      isActive: true
    };

    if (status && ['open', 'assigned', 'resolved', 'closed'].includes(status)) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const chatRooms = await ChatRoom.find(query)
      .populate('userId', 'name email phone_number avatar_url')
      .populate('assignedStaff', 'name avatar_url')
      .sort({ priority: -1, lastMessageAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ChatRoom.countDocuments(query);

    res.json({
      chatRooms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasMore: skip + chatRooms.length < total
      }
    });
  } catch (error) {
    console.error('Get assigned chat rooms error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy tất cả phòng chat (Admin)
exports.getAllChatRooms = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền xem tất cả phòng chat' });
    }

    const { status, category, priority, assigned, page = 1, limit = 25 } = req.query;

    const query = { isActive: true };

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assigned === 'true') query.assignedStaff = { $ne: null };
    if (assigned === 'false') query.assignedStaff = null;

    const skip = (page - 1) * limit;

    const chatRooms = await ChatRoom.find(query)
      .populate('userId', 'name email phone_number avatar_url')
      .populate('assignedStaff', 'name avatar_url role')
      .sort({
        priority: -1,
        status: 1,
        lastMessageAt: -1
      })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ChatRoom.countDocuments(query);

    // Statistics
    const stats = await ChatRoom.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {
      open: 0,
      assigned: 0,
      resolved: 0,
      closed: 0
    };

    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.json({
      chatRooms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasMore: skip + chatRooms.length < total
      },
      statistics: statusStats
    });
  } catch (error) {
    console.error('Get all chat rooms error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết phòng chat
exports.getChatRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    const chatRoom = await ChatRoom.findOne({ roomId, isActive: true })
      .populate('userId', 'name email phone_number avatar_url')
      .populate('assignedStaff', 'name avatar_url role');

    if (!chatRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chat' });
    }

    const hasAccess =
      req.user.role === 'admin' ||
      chatRoom.userId._id.toString() === req.user.userId ||
      (chatRoom.assignedStaff && chatRoom.assignedStaff._id.toString() === req.user.userId);

    console.log('🔍 Req user:', req.user);
    console.log('🔍 Chat room:', chatRoom);
    console.log('🔍 hasAccess:', hasAccess);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Không có quyền truy cập phòng chat này' });
    }

    res.json(chatRoom);
  } catch (error) {
    console.error('Get chat room error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Gán staff cho phòng chat (Admin)
exports.assignStaffToRoom = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền gán staff' });
    }

    const { roomId } = req.params;
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({ message: 'Vui lòng chọn staff để gán' });
    }

    // Kiểm tra staff có tồn tại và có role phù hợp
    const staff = await User.findById(staffId);
    if (!staff || !['admin', 'staff'].includes(staff.role)) {
      return res.status(400).json({ message: 'Staff không hợp lệ' });
    }

    const chatRoom = await ChatRoom.findOne({ roomId, isActive: true });
    if (!chatRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chat' });
    }

    chatRoom.assignedStaff = staffId;
    chatRoom.status = 'assigned';
    await chatRoom.save();

    await chatRoom.populate([
      { path: 'userId', select: 'name email phone_number avatar_url' },
      { path: 'assignedStaff', select: 'name avatar_url role' }
    ]);

    // Emit socket event nếu có
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('room_assigned', {
        roomId,
        assignedStaff: chatRoom.assignedStaff,
        message: `Phòng chat đã được gán cho ${staff.name}`
      });
    }

    res.json({
      message: 'Gán staff thành công',
      chatRoom
    });
  } catch (error) {
    console.error('Assign staff error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật trạng thái phòng chat
exports.updateRoomStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body;

    if (!['open', 'assigned', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const chatRoom = await ChatRoom.findOne({ roomId, isActive: true });
    if (!chatRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chat' });
    }

    const hasPermission =
      req.user.role === 'admin' ||
      (req.user.role === 'staff' && chatRoom.assignedStaff?.toString() === req.user.userId);

    if (!hasPermission) {
      return res.status(403).json({ message: 'Không có quyền cập nhật phòng chat này' });
    }

    chatRoom.status = status;
    if (status === 'closed') {
      chatRoom.isActive = false;
    }
    chatRoom.updatedAt = new Date();
    await chatRoom.save();
    await chatRoom.populate('assignedStaff', 'name avatar_url role');

    console.log('Backend updateRoomStatus:', { roomId, status, updatedBy: req.user.userId });

    const io = req.app.get('io');
    if (io) {
      io.of('/chat').to(roomId).emit('room_status_updated', {
        roomId,
        status,
        updatedBy: req.user.userId,
        updatedAt: chatRoom.updatedAt
      });
    }

    res.json({
      message: 'Cập nhật trạng thái thành công',
      chatRoom
    });
  } catch (error) {
    console.error('Update room status error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Gửi tin nhắn
exports.sendMessage = async (req, res) => {
  try {
    const { roomId, content, type = 'text', metadata = {} } = req.body;

    if (!roomId || !content?.trim()) {
      return res.status(400).json({ message: 'Thiếu thông tin tin nhắn' });
    }

    // Kiểm tra phòng chat
    const chatRoom = await ChatRoom.findOne({ roomId, isActive: true });
    if (!chatRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chat' });
    }

    // Kiểm tra quyền gửi tin nhắn
    const hasPermission =
      req.user.role === 'admin' ||
      chatRoom.userId.toString() === req.user.userId ||
      (chatRoom.assignedStaff && chatRoom.assignedStaff.toString() === req.user.userId);

    if (!hasPermission) {
      return res.status(403).json({ message: 'Không có quyền gửi tin nhắn trong phòng này' });
    }

    // Lấy thông tin người gửi
    const sender = await User.findById(req.user.userId).select('name avatar_url role');

    // Tạo tin nhắn trong Supabase
    const messageData = {
      room_id: roomId,
      sender_id: req.user.userId,
      sender_role: req.user.role,
      sender_name: sender.name,
      sender_avatar: sender.avatar_url,
      content: content.trim(),
      type,
      metadata,
      created_at: new Date().toISOString()
    };

    const { data: message, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ message: 'Lỗi lưu tin nhắn', error: error.message });
    }

    // Cập nhật thời gian tin nhắn cuối
    chatRoom.lastMessageAt = new Date();
    await chatRoom.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('new_message', {
        ...message,
        sender: {
          id: sender._id,
          name: sender.name,
          avatar_url: sender.avatar_url,
          role: sender.role
        }
      });

      // Emit room update
      io.emit('room_updated', {
        roomId,
        lastMessageAt: chatRoom.lastMessageAt
      });
    }

    res.status(201).json({
      message: 'Gửi tin nhắn thành công',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy tin nhắn trong phòng
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Kiểm tra phòng chat và quyền truy cập
    const chatRoom = await ChatRoom.findOne({ roomId, isActive: true });
    if (!chatRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chat' });
    }

    const hasPermission =
      req.user.role === 'admin' ||
      chatRoom.userId.toString() === req.user.userId ||
      (chatRoom.assignedStaff && chatRoom.assignedStaff.toString() === req.user.userId);

    if (!hasPermission) {
      return res.status(403).json({ message: 'Không có quyền truy cập tin nhắn' });
    }

    // Lấy tin nhắn từ Supabase
    const offset = (page - 1) * limit;
    const { data: messages, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      console.error('Supabase select error:', error);
      return res.status(500).json({ message: 'Lỗi lấy tin nhắn', error: error.message });
    }

    res.json({
      messages: messages.reverse(), // Reverse để hiển thị từ cũ đến mới
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        total: count,
        hasMore: offset + messages.length < count
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy thống kê chat (Admin)
exports.getChatStatistics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền xem thống kê' });
    }

    const { period = '7d' } = req.query;
    const daysBack = period === '30d' ? 30 : 7;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Thống kê phòng chat
    const roomStats = await ChatRoom.aggregate([
      {
        $facet: {
          statusStats: [
            { $match: { isActive: true } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          categoryStats: [
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          dailyStats: [
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id': 1 } }
          ],
          totalRooms: [
            { $match: { isActive: true } },
            { $count: 'total' }
          ]
        }
      }
    ]);

    // Thống kê tin nhắn từ Supabase
    const { data: messageStats, error } = await supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Supabase stats error:', error);
    }

    const totalMessages = messageStats ? messageStats.length : 0;

    // Staff performance
    const staffStats = await ChatRoom.aggregate([
      {
        $match: {
          assignedStaff: { $ne: null },
          isActive: true
        }
      },
      {
        $group: {
          _id: '$assignedStaff',
          roomCount: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staff',
          pipeline: [{ $project: { name: 1, avatar_url: 1 } }]
        }
      },
      { $unwind: '$staff' }
    ]);

    res.json({
      rooms: {
        status: roomStats[0].statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        category: roomStats[0].categoryStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        daily: roomStats[0].dailyStats,
        total: roomStats[0].totalRooms[0]?.total || 0
      },
      messages: {
        total: totalMessages,
        period: period
      },
      staff: staffStats.map(staff => ({
        id: staff._id,
        name: staff.staff.name,
        avatar_url: staff.staff.avatar_url,
        roomCount: staff.roomCount,
        resolvedCount: staff.resolvedCount,
        resolutionRate: staff.roomCount > 0 ? (staff.resolvedCount / staff.roomCount * 100).toFixed(1) : 0
      }))
    });
  } catch (error) {
    console.error('Get chat statistics error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

