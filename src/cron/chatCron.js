// src/cron/chatCron.js
const cron = require('node-cron');
const ChatRoom = require('../models/ChatRoom');
const { supabase } = require('../config/supabase');

// Tự động đóng phòng chat không hoạt động
const autoCloseInactiveRooms = async () => {
  try {
    console.log('🔄 Running auto close inactive rooms...');
    
    // Tìm phòng không có tin nhắn trong 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const inactiveRooms = await ChatRoom.find({
      status: { $in: ['open', 'assigned'] },
      lastMessageAt: { $lt: oneDayAgo },
      isActive: true
    });

    for (const room of inactiveRooms) {
      // Gửi tin nhắn thông báo tự động đóng
      const notificationMessage = {
        room_id: room.roomId,
        sender_id: 'system',
        sender_role: 'system',
        sender_name: 'Hệ thống',
        sender_avatar: null,
        content: 'Phòng chat đã được đóng tự động do không có hoạt động trong 24 giờ. Bạn có thể tạo phòng chat mới nếu cần hỗ trợ.',
        type: 'text',
        metadata: { auto_close: true },
        created_at: new Date().toISOString()
      };

      await supabase.from('messages').insert([notificationMessage]);

      // Cập nhật trạng thái phòng
      room.status = 'closed';
      room.isActive = false;
      await room.save();
    }

    console.log(`✅ Auto closed ${inactiveRooms.length} inactive rooms`);
  } catch (error) {
    console.error('❌ Auto close rooms error:', error);
  }
};

// Tự động gán staff cho phòng chờ
const autoAssignStaffToWaitingRooms = async () => {
  try {
    console.log('🔄 Running auto assign staff...');
    
    const { autoAssignStaff } = require('../utils/chatUtils');
    
    // Tìm phòng đang chờ assign > 30 phút
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const waitingRooms = await ChatRoom.find({
      status: 'open',
      assignedStaff: null,
      createdAt: { $lt: thirtyMinutesAgo },
      isActive: true
    });

    for (const room of waitingRooms) {
      const assignedStaff = await autoAssignStaff(room.roomId);
      if (assignedStaff) {
        console.log(`📋 Auto assigned staff ${assignedStaff.name} to room ${room.roomId}`);
      }
    }

    console.log(`✅ Processed ${waitingRooms.length} waiting rooms`);
  } catch (error) {
    console.error('❌ Auto assign staff error:', error);
  }
};

// Setup cron jobs
const startChatCronJobs = () => {
  // Chạy mỗi giờ để đóng phòng không hoạt động
  cron.schedule('0 * * * *', autoCloseInactiveRooms);
  
  // Chạy mỗi 15 phút để gán staff tự động
  cron.schedule('*/15 * * * *', autoAssignStaffToWaitingRooms);
  
  console.log('✅ Chat cron jobs started');
};

module.exports = { startChatCronJobs };
