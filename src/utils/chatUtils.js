// src/utils/chatUtils.js
const ChatRoom = require('../models/ChatRoom');
const { supabase } = require('../config/supabase');

// Tự động gán staff cho phòng chat mới
const autoAssignStaff = async (roomId) => {
  try {
    // Logic tự động gán staff (round-robin hoặc theo workload)
    const User = require('../models/user');
    
    // Tìm staff có ít phòng assigned nhất
    const staffStats = await ChatRoom.aggregate([
      { 
        $match: { 
          assignedStaff: { $ne: null }, 
          status: { $in: ['assigned', 'open'] },
          isActive: true 
        } 
      },
      {
        $group: {
          _id: '$assignedStaff',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: 1 } }
    ]);

    // Tìm tất cả staff
    const allStaff = await User.find({ role: 'staff', isActive: true }).select('_id');
    
    let selectedStaff;
    if (staffStats.length === 0) {
      // Chưa có staff nào được gán, chọn staff đầu tiên
      selectedStaff = allStaff[0];
    } else {
      // Tìm staff có ít phòng nhất hoặc chưa có phòng nào
      const assignedStaffIds = staffStats.map(s => s._id.toString());
      const unassignedStaff = allStaff.filter(s => !assignedStaffIds.includes(s._id.toString()));
      
      if (unassignedStaff.length > 0) {
        selectedStaff = unassignedStaff[0];
      } else {
        // Chọn staff có ít phòng nhất
        selectedStaff = await User.findById(staffStats[0]._id);
      }
    }

    if (selectedStaff) {
      await ChatRoom.findOneAndUpdate(
        { roomId },
        { 
          assignedStaff: selectedStaff._id,
          status: 'assigned'
        }
      );

      return selectedStaff;
    }

    return null;
  } catch (error) {
    console.error('Auto assign staff error:', error);
    return null;
  }
};

// Tính toán thời gian phản hồi trung bình
const calculateResponseTime = async (roomId) => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('created_at, sender_role')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error || !messages || messages.length < 2) {
      return null;
    }

    const responseTimes = [];
    let lastUserMessage = null;

    for (const message of messages) {
      if (message.sender_role === 'user') {
        lastUserMessage = new Date(message.created_at);
      } else if (lastUserMessage && ['staff', 'admin'].includes(message.sender_role)) {
        const responseTime = new Date(message.created_at) - lastUserMessage;
        responseTimes.push(responseTime);
        lastUserMessage = null;
      }
    }

    if (responseTimes.length === 0) return null;

    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(avgResponseTime / 1000 / 60); // Convert to minutes
  } catch (error) {
    console.error('Calculate response time error:', error);
    return null;
  }
};

// Format tin nhắn cho notification
const formatMessageForNotification = (message, roomInfo) => {
  const maxLength = 100;
  let content = message.content;
  
  if (message.type === 'image') {
    content = '[Hình ảnh]';
  } else if (content.length > maxLength) {
    content = content.substring(0, maxLength) + '...';
  }

  return {
    title: `Tin nhắn mới từ ${roomInfo.subject}`,
    body: `${message.sender_name}: ${content}`,
    data: {
      type: 'chat_message',
      roomId: message.room_id,
      messageId: message.id
    }
  };
};

module.exports = {
  autoAssignStaff,
  calculateResponseTime,
  formatMessageForNotification
};
