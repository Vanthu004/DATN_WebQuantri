// src/sockets/chatSocket.js
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/user');
const { supabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');

const chatSocketHandler = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      console.log('🔍 Socket auth attempt:', { token: token ? 'present' : 'missing' });
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔍 Socket auth decoded:', decoded);
      const user = await User.findById(decoded.userId).select('name avatar_url');
      if (!user || user.ban?.isBanned) {
        return next(new Error('Authentication error: User not found or banned'));
      }
      socket.userId = user._id.toString();
      socket.userRole = decoded.role; // Dùng role từ token
      socket.userName = user.name;
      next();
    } catch (error) {
      console.error('🔍 Socket auth error:', error.message);
      next(new Error(`Authentication error: ${error.message}`));
    }
  });

  chatNamespace.on('connection', (socket) => {
    console.log(`👤 User connected to /chat: ${socket.userName} (${socket.userRole})`);

    socket.on('join_user_rooms', async () => {
      try {
        let rooms = [];
        if (socket.userRole === 'admin') {
          rooms = await ChatRoom.find({ isActive: true }).select('roomId');
        } else if (socket.userRole === 'staff') {
          rooms = await ChatRoom.find({
            assignedStaff: socket.userId,
            isActive: true
          }).select('roomId');
        } else {
          rooms = await ChatRoom.find({
            userId: socket.userId,
            isActive: true
          }).select('roomId');
        }

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

    socket.on('room_status_updated', data => {
      console.log('Received room_status_updated:', data);
      const { roomId, status } = data;
      if (!roomId || !status) {
        socket.emit('error', { message: 'Thiếu thông tin cập nhật trạng thái phòng' });
        return;
      }
      socket.to(roomId).emit('room_status_updated', data);
      console.log(`🔄 Room ${roomId} status updated to ${status} by ${socket.userName}`)
      socket.emit('room_status_updated', {
        roomId,
        status,
        message: `Trạng thái phòng ${roomId} đã được cập nhật thành ${status}`
      })
    });

    socket.on('join_room', async (data) => {
      try {
        const { roomId } = data;
        if (!roomId) {
          socket.emit('error', { message: 'roomId không được để trống' });
          return;
        }

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

        console.log('🔍 Socket join_room:', {
          roomId,
          user: { id: socket.userId, role: socket.userRole, name: socket.userName },
          hasAccess,
          chatRoom: { userId: chatRoom.userId._id, assignedStaff: chatRoom.assignedStaff?._id }
        });

        if (!hasAccess) {
          socket.emit('error', { message: 'Không có quyền truy cập phòng này' });
          return;
        }

        socket.join(roomId);
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

    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, type = 'text', metadata = {} } = data;
        console.log('🔍 Received send_message:', { roomId, content, type, user: { id: socket.userId, role: socket.userRole, name: socket.userName } });
        if (!roomId || !content?.trim()) {
          socket.emit('error', { message: 'Thiếu thông tin tin nhắn' });
          return;
        }
        const chatRoom = await ChatRoom.findOne({ roomId, isActive: true });
        if (!chatRoom) {
          socket.emit('error', { message: 'Không tìm thấy phòng chat' });
          return;
        }
        const hasPermission =
          socket.userRole === 'admin' ||
          chatRoom.userId.toString() === socket.userId ||
          (chatRoom.assignedStaff && chatRoom.assignedStaff.toString() === socket.userId);
        console.log('🔍 Socket send_message:', {
          roomId,
          user: { id: socket.userId, role: socket.userRole, name: socket.userName },
          hasPermission,
          chatRoom: { userId: chatRoom.userId.toString(), assignedStaff: chatRoom.assignedStaff?.toString() }
        });
        if (!hasPermission) {
          socket.emit('error', { message: 'Không có quyền gửi tin nhắn' });
          return;
        }
        const user = await User.findById(socket.userId).select('name avatar_url');
        console.log('🔍 User data from MongoDB:', { id: user._id, role: socket.userRole, name: user.name });
        const messageData = {
          room_id: roomId,
          sender_id: socket.userId,
          sender_role: socket.userRole, // Dùng socket.userRole từ token
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
        chatRoom.lastMessageAt = new Date();
        await chatRoom.save();
        const messageWithSender = {
          ...message,
          sender: {
            id: socket.userId,
            name: user.name,
            avatar_url: user.avatar_url,
            role: socket.userRole // Dùng socket.userRole từ token
          }
        };
        console.log('🔍 Emitting new_message:', messageWithSender);
        chatNamespace.to(roomId).emit('new_message', messageWithSender);
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

    socket.on('update_online_status', async (status) => {
      try {
        await User.findByIdAndUpdate(socket.userId, {
          lastSeen: new Date(),
          isOnline: status === 'online'
        });

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

    socket.on('disconnect', async () => {
      try {
        console.log(`👋 User disconnected: ${socket.userName}`);
        await User.findByIdAndUpdate(socket.userId, {
          lastSeen: new Date(),
          isOnline: false
        });

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

  const realtimeChannel = setupSupabaseRealtime();

  return { chatNamespace, realtimeChannel };
};

module.exports = chatSocketHandler;