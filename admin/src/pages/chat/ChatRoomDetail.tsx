// admin/src/pages/chat/ChatRoomDetail.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi } from '../../services/chatApi';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ChatRoom, Message } from '../../interfaces/chat';
import { useChat } from '../../contexts/ChatContext';
import { toast } from 'react-toastify';
import '../../css/chat/chatRoomDetail.css';

interface User {
  role: string;
  userId: string;
  name: string;
}


const ChatRoomDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [staffList, setStaffList] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [uploading, setUploading] = useState(false);

  const { messages, dispatch, joinRoom, leaveRoom, sendMessage, isConnected } = useChat();

  useEffect(() => {
    // Get user info from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          role: payload.role || 'staff',
          userId: payload.userId,
          name: payload.name || 'User'
        });
      } catch (error) {
        console.error('Error parsing token:', error);
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (roomId && user) {
      loadRoomData();
    }
  }, [roomId, user]);

  useEffect(() => {
    if (roomId && isConnected) {
      joinRoom(roomId);
      return () => leaveRoom(roomId);
    }
  }, [roomId, isConnected, joinRoom, leaveRoom]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRoomData = async () => {
    if (!roomId || !user) return;

    setLoading(true);
    try {
      // Load room details
      const roomData = await chatApi.getChatRoomById(roomId);
      setRoom(roomData);

      // Load messages
      const messagesData = await chatApi.getMessages(roomId, { limit: 100 });
      dispatch({ type: 'SET_MESSAGES', payload: messagesData.messages });

      // Load staff list for assignment (admin only)
      if (user.role === 'admin') {
        try {
          const staff = await chatApi.getStaffList();
          setStaffList(staff);
        } catch (error) {
          console.error('Load staff error:', error);
        }
      }
    } catch (error) {
      console.error('Load room data error:', error);
      toast.error('Không thể tải dữ liệu phòng chat');
      navigate('/chat/rooms');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !roomId || sending) return;

    setSending(true);
    try {
      // Use socket for real-time
      sendMessage(roomId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (file: File) => {
  if (!roomId) return;

  setUploading(true);
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'swear_unsigned'); // ✅ đúng preset từ .env

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/du6cuhb3q/image/upload', // ✅ đúng CLOUDINARY_CLOUD_NAME
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    const imageUrl = data.secure_url;

    sendMessage(roomId, imageUrl, 'image');
  } catch (error) {
    console.error('Image upload error:', error);
    toast.error('Không thể tải ảnh lên');
  } finally {
    setUploading(false);
  }
};


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    } else if (file) {
      toast.error('Chỉ hỗ trợ tải ảnh lên');
    }
  };

  const handleAssignStaff = async () => {
    if (!roomId || !selectedStaff || !user || user.role !== 'admin') return;

    try {
      await chatApi.assignStaffToRoom(roomId, selectedStaff);
      toast.success('Gán staff thành công');
      setShowAssignModal(false);
      loadRoomData(); // Reload room data
    } catch (error) {
      console.error('Assign staff error:', error);
      toast.error('Không thể gán staff');
    }
  };

  const handleUpdateStatus = async (newStatus: ChatRoom['status']) => {
    if (!roomId || !room) return;

    try {
      await chatApi.updateRoomStatus(roomId, newStatus);
      setRoom({ ...room, status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="chat-room-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải phòng chat...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="chat-room-detail">
        <div className="error-container">
          <h3>Không tìm thấy phòng chat</h3>
          <button onClick={() => navigate('/chat/rooms')} className="btn btn-primary">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-room-detail">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="header-left">
          <button onClick={() => navigate('/chat/rooms')} className="back-btn">
            ← Quay lại
          </button>
          
          <div className="customer-info">
            <div className="customer-avatar">
              {room.userId.avatar_url ? (
                <img src={room.userId.avatar_url} alt={room.userId.name} />
              ) : (
                <div className="avatar-placeholder">
                  {room.userId.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="customer-details">
              <h2>{room.userId.name}</h2>
              <p>{room.subject}</p>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="room-status">
            <select
              value={room.status}
              onChange={(e) => handleUpdateStatus(e.target.value as ChatRoom['status'])}
              disabled={user?.role === 'staff' && room.assignedStaff?._id !== user.userId}
            >
              <option value="open">Mở</option>
              <option value="assigned">Đã gán</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
            </select>
          </div>

          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowAssignModal(true)}
              className="btn btn-outline"
            >
              Gán Staff
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.userId;
            
            return (
              <div
                key={message.id}
                className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
              >
                {!isOwnMessage && (
                  <div className="message-avatar">
                    {message.sender_avatar ? (
                      <img src={message.sender_avatar} alt={message.sender_name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {message.sender_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="message-content">
                  {!isOwnMessage && (
                    <div className="message-sender">{message.sender_name}</div>
                  )}
                  
                  <div className="message-bubble">
                    {message.type === 'image' ? (
                      <div className="message-image">
                        <img 
                          src={message.content} 
                          alt="Ảnh đã gửi"
                          onClick={() => window.open(message.content, '_blank')}
                        />
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                  
                  <div className="message-time">
                    {formatMessageTime(message.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <form onSubmit={handleSendMessage} className="message-form">
          <div className="input-wrapper">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="attachment-btn"
              disabled={uploading}
            >
              {uploading ? '⏳' : '📎'}
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="message-input"
              disabled={room.status === 'closed'}
            />
            
            <button
              type="submit"
              className="send-btn"
              disabled={!newMessage.trim() || sending || room.status === 'closed'}
            >
              {sending ? '⏳' : '📤'}
            </button>
          </div>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Assign Staff Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Gán Staff cho phòng chat</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Chọn Staff:</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                >
                  <option value="">-- Chọn Staff --</option>
                  {staffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} ({staff.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn btn-outline"
              >
                Hủy
              </button>
              <button
                onClick={handleAssignStaff}
                className="btn btn-primary"
                disabled={!selectedStaff}
              >
                Gán Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoomDetail;