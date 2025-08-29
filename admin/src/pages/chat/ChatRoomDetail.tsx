
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi } from '../../services/chatApi';
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
  const [staffList, setStaffList] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [uploading, setUploading] = useState(false);

  const { messages, dispatch, joinRoom, leaveRoom, sendMessage, isConnected } = useChat();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 Token payload:', payload);
        setUser({
          role: payload.role || 'staff',
          userId: payload.userId,
          name: payload.name || 'User'
        });
      } catch (error) {
        console.error('Error parsing token:', error);
        toast.error('Vui lòng đăng nhập lại');
        navigate('/login');
      }
    } else {
      console.error('No token found');
      toast.error('Không tìm thấy token, vui lòng đăng nhập');
      navigate('/login');
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRoomData = async () => {
    if (!roomId || !user) return;

    setLoading(true);
    try {
      const roomData = await chatApi.getChatRoomById(roomId);
      console.log('🔍 Room data:', roomData);
      setRoom(roomData);

      const messagesData = await chatApi.getMessages(roomId, { limit: 100 });
      console.log('🔍 Messages data:', messagesData);
      dispatch({ type: 'SET_MESSAGES', payload: messagesData.messages });

      if (user.role === 'admin') {
        try {
          const staff = await chatApi.getStaffList();
          const filteredStaff = staff.filter(user => user.role === 'staff');
          console.log('🔍 Filtered staff list:', filteredStaff);
          setStaffList(filteredStaff);
        } catch (error) {
          console.error('Load staff error:', error);
          toast.error('Không thể tải danh sách nhân viên');
        }
      }
    } catch (error: any) {
      console.error('Load room data error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Không thể tải dữ liệu phòng chat');
      if (!room) {
        navigate('/chat/rooms');
      }
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
      formData.append('upload_preset', 'swear_unsigned');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/du6cuhb3q/image/upload',
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
      toast.success('Gán nhân viên thành công');
      setShowAssignModal(false);
      loadRoomData();
    } catch (error) {
      console.error('Assign staff error:', error);
      toast.error('Không thể gán nhân viên');
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

  return (
    <div className="chat-room-detail">
      {room ? (
        <>
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

              {/* {user?.role === 'admin' && (
                <button 
                  onClick={() => setShowAssignModal(true)}
                  className="btn btn-outline"
                >
                  Gán Nhân viên
                </button>
              )} */}
            </div>
          </div>

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
                        <div className="message-sender">{message.sender_name} ({message.sender_role === 'staff' ? 'Nhân viên' : message.sender_role})</div>
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

          {showAssignModal && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Gán Nhân viên cho phòng chat</h3>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="close-btn"
                  >
                    ×
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="form-group">
                    <label>Chọn Nhân viên:</label>
                    <select
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                    >
                      <option value="">-- Chọn Nhân viên --</option>
                      {staffList.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name} (Nhân viên)
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
                    Gán Nhân viên
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="chat-room-detail">
          <div className="error-container">
            <h3>Không tìm thấy phòng chat</h3>
            <button onClick={() => navigate('/chat/rooms')} className="btn btn-primary">
              Quay lại danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoomDetail;
