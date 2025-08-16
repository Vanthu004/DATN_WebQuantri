// src/sockets/chatSocket.js
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/user');
const { supabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');

const chatSocketHandler = (io) => {
  // Namespace cho chat
  const chatNamespace = io.of('/chat');

  // Authentication middleware cho socket
  chatNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || user.ban?.isBanned) {
        return next(new Error('Authentication error: User not found or banned'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;
      next();
    } catch (error) {
      next(new Error(`Authentication error: ${error.message}`));
    }
  });

  chatNamespace.on('connection', (socket) => {
    console.log(`👤 User connected to chat: ${socket.userName} (${socket.userRole})`);

    // Tự động join các phòng chat mà user có quyền truy cập
    socket.on('join_user_rooms', async () => {
      try {
        let rooms = [];
        
        if (socket.userRole === 'admin') {
          // Admin có thể join tất cả phòng
          rooms = await ChatRoom.find({ isActive: true }).select('roomId');
        } else if (socket.userRole === 'staff') {
          // Staff join phòng được gán
          rooms = await ChatRoom.find({ 
            assignedStaff: socket.userId, 
            isActive: true 
          }).select('roomId');
        } else {
          // User join phòng của mình
          rooms = await ChatRoom.find({ 
            userId: socket.userId, 
            isActive: true 
          }).select('roomId');
        }

        // Join các phòng
        for (const room of rooms) {
          socket.join(room.roomId);
        }

        socket.emit('rooms_joined', {
          message: 'Đã tham gia các phòng chat',
          rooms: rooms.map(r => r.roomId),
          count: rooms.length
        });

        console.log(`📱 ${socket.userName} joined ${rooms.length} rooms`);
      } catch (error) {
        console.error('Join rooms error:', error);
        socket.emit('error', { message: 'Lỗi tham gia phòng chat' });
      }
    });

    // Join phòng chat cụ thể
    socket.on('join_room', async (data) => {
      try {
        const { roomId } = data;
        
        if (!roomId) {
          socket.emit('error', { message: 'roomId không được để trống' });
          return;
        }

        // Kiểm tra quyền truy cập phòng
        const chatRoom = await ChatRoom.findOne({ roomId, isActive: true })
          .populate('userId', 'name')
          .populate('assignedStaff', 'name');
        
        if (!chatRoom) {
          socket.emit('error', { message: 'Không tìm thấy phòng chat' });
          return;
        }

        const hasAccess = 
          socket.userRole === 'admin' ||
          chatRoom.userId._id.toString() === socket.userId ||
          (chatRoom.assignedStaff && chatRoom.assignedStaff._id.toString() === socket.userId);

        if (!hasAccess) {
          socket.emit('error', { message: 'Không có quyền truy cập phòng này' });
          return;
        }

        socket.join(roomId);
        
        // Thông báo cho phòng có user mới join
        socket.to(roomId).emit('user_joined', {
          userId: socket.userId,
          userName: socket.userName,
          userRole: socket.userRole,
          joinedAt: new Date()
        });

        socket.emit('room_joined', { 
          roomId, 
          message: 'Đã tham gia phòng chat',
          roomInfo: {
            subject: chatRoom.subject,
            status: chatRoom.status,
            category: chatRoom.category
          }
        });

        console.log(`🚪 ${socket.userName} joined room: ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Lỗi tham gia phòng chat' });
      }
    });

    // Rời khỏi phòng chat
    socket.on('leave_room', (data) => {
      try {
        const { roomId } = data;
        
        socket.leave(roomId);
        socket.to(roomId).emit('user_left', {
          userId: socket.userId,
          userName: socket.userName,
          leftAt: new Date()
        });

        socket.emit('room_left', { roomId, message: 'Đã rời khỏi phòng chat' });
        console.log(`🚪 ${socket.userName} left room: ${roomId}`);
      } catch (error) {
        console.error('Leave room error:', error);
        socket.emit('error', { message: 'Lỗi rời phòng chat' });
      }
    });

    // Gửi tin nhắn thông qua socket
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, type = 'text', metadata = {} } = data;

        if (!roomId || !content?.trim()) {
          socket.emit('error', { message: 'Thiếu thông tin tin nhắn' });
          return;
        }

        // Kiểm tra quyền gửi tin nhắn
        const chatRoom = await ChatRoom.findOne({ roomId, isActive: true });
        if (!chatRoom) {
          socket.emit('error', { message: 'Không tìm thấy phòng chat' });
          return;
        }

        const hasPermission = 
          socket.userRole === 'admin' ||
          chatRoom.userId.toString() === socket.userId ||
          (chatRoom.assignedStaff && chatRoom.assignedStaff.toString() === socket.userId);

        if (!hasPermission) {
          socket.emit('error', { message: 'Không có quyền gửi tin nhắn' });
          return;
        }

        // Lấy thông tin user
        const user = await User.findById(socket.userId).select('name avatar_url role');

        // Lưu tin nhắn vào Supabase
        const messageData = {
          room_id: roomId,
          sender_id: socket.userId,
          sender_role: socket.userRole,
          sender_name: user.name,
          sender_avatar: user.avatar_url,
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
          console.error('Supabase message error:', error);
          socket.emit('error', { message: 'Lỗi lưu tin nhắn' });
          return;
        }

        // Cập nhật thời gian tin nhắn cuối
        chatRoom.lastMessageAt = new Date();
        await chatRoom.save();

        // Broadcast tin nhắn cho tất cả user trong phòng
        const messageWithSender = {
          ...message,
          sender: {
            id: socket.userId,
            name: user.name,
            avatar_url: user.avatar_url,
            role: user.role
          }
        };

        chatNamespace.to(roomId).emit('new_message', messageWithSender);

        // Emit room update
        chatNamespace.emit('room_updated', {
          roomId,
          lastMessageAt: chatRoom.lastMessageAt,
          updatedBy: socket.userId
        });

        console.log(`💬 Message sent by ${socket.userName} in room ${roomId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Lỗi gửi tin nhắn' });
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        roomId
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user_stopped_typing', {
        userId: socket.userId,
        roomId
      });
    });

    // Update user online status
    socket.on('update_online_status', async (status) => {
      try {
        await User.findByIdAndUpdate(socket.userId, {
          lastSeen: new Date(),
          isOnline: status === 'online'
        });

        // Broadcast status change
        socket.broadcast.emit('user_status_changed', {
          userId: socket.userId,
          userName: socket.userName,
          status,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Update status error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        console.log(`👋 User disconnected: ${socket.userName}`);
        
        // Update last seen
        await User.findByIdAndUpdate(socket.userId, {
          lastSeen: new Date(),
          isOnline: false
        });

        // Broadcast offline status
        socket.broadcast.emit('user_status_changed', {
          userId: socket.userId,
          userName: socket.userName,
          status: 'offline',
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

  // Listen to Supabase realtime cho fallback
  const setupSupabaseRealtime = () => {
    const messageChannel = supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        async (payload) => {
          try {
            const message = payload.new;
            
            // Get sender info
            const sender = await User.findById(message.sender_id)
              .select('name avatar_url role');

            if (sender) {
              const messageWithSender = {
                ...message,
                sender: {
                  id: message.sender_id,
                  name: sender.name,
                  avatar_url: sender.avatar_url,
                  role: sender.role
                }
              };

              // Emit to room (as fallback)
              chatNamespace.to(message.room_id).emit('new_message_realtime', messageWithSender);
            }
          } catch (error) {
            console.error('Realtime message error:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Supabase realtime status:', status);
      });

    return messageChannel;
  };

  // Setup realtime subscription
  const realtimeChannel = setupSupabaseRealtime();

  return { chatNamespace, realtimeChannel };
};

module.exports = chatSocketHandler;