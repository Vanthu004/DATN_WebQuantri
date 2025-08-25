import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chatApi, ChatRoomsResponse } from '../../services/chatApi';
import { ChatStatistics } from '../../interfaces/chat';
import { toast } from 'react-toastify';
import '../../css/chat/chatDashboard.css';

interface User {
  role: string;
}

const ChatDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<ChatStatistics | null>(null);
  const [recentRooms, setRecentRooms] = useState<ChatRoomsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ role: payload.role || 'staff' });
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        if (user.role === 'admin') {
          const stats = await chatApi.getChatStatistics('7d');
          setStatistics(stats);
        }

        let roomsData;
        if (user.role === 'admin') {
          roomsData = await chatApi.getAllChatRooms({
            status: 'open',
            assigned: false,
            limit: 10,
          });
        } else {
          roomsData = await chatApi.getAssignedChatRooms({
            status: 'assigned',
            limit: 10,
          });
        }
        // Sort client-side theo createdAt mới nhất
        roomsData.chatRooms = roomsData.chatRooms.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setRecentRooms(roomsData);
        console.log('🔍 Recent rooms response:', roomsData);
      } catch (error) {
        console.error('Load dashboard error:', error);
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#ff9800';
      case 'assigned': return '#2196f3';
      case 'resolved': return '#4caf50';
      case 'closed': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  if (loading) {
    return (
      <div className="chat-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-dashboard">
      <div className="dashboard-header">
        <h1>Chat Support Dashboard</h1>
        <div className="header-actions">
          <Link to="/chat/rooms" className="btn btn-primary">
            Xem tất cả phòng chat
          </Link>
        </div>
      </div>

      {/* Statistics Cards - Admin only */}
      {user?.role === 'admin' && statistics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon open">📩</div>
            <div className="stat-content">
              <h3>{statistics.rooms.status.open || 0}</h3>
              <p>Phòng chờ xử lý</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon assigned">👥</div>
            <div className="stat-content">
              <h3>{statistics.rooms.status.assigned || 0}</h3>
              <p>Đang xử lý</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon resolved">✅</div>
            <div className="stat-content">
              <h3>{statistics.rooms.status.resolved || 0}</h3>
              <p>Đã giải quyết</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon messages">💬</div>
            <div className="stat-content">
              <h3>{statistics.messages.total || 0}</h3>
              <p>Tin nhắn (7 ngày)</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Rooms */}
      <div className="recent-rooms-section">
        <div className="section-header">
          <h2>
            {user?.role === 'admin' ? 'Phòng chat mới chưa gán' : 'Phòng được gán chưa xử lý xong'}
          </h2>
          <Link 
            to={user?.role === 'admin' ? '/chat/rooms?status=open&assigned=false' : '/chat/rooms?status=assigned'} 
            className="view-all-link"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="rooms-list">
          {recentRooms?.chatRooms?.length === 0 ? (
            <div className="empty-state">
              <p>
                {user?.role === 'admin' 
                  ? 'Không có phòng chat mới chưa gán' 
                  : 'Bạn chưa được gán phòng chat nào chưa xử lý xong'}
              </p>
            </div>
          ) : (
            recentRooms?.chatRooms?.map((room) => (
              <Link
                key={room._id}
                to={`/chat/room/${room.roomId}`}
                className="room-card"
              >
                <div className="room-avatar">
                  {room?.userId?.avatar_url ? (
                    <img src={room.userId.avatar_url} alt={room.userId.name || 'User'} />
                  ) : (
                    <div className="avatar-placeholder">
                      {room?.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                
                <div className="room-info">
                  <div className="room-header">
                    <h3 className="room-subject">{room.subject}</h3>
                    <span className="room-time">
                      {formatTimeAgo(room.lastMessageAt)}
                    </span>
                  </div>
                  
                  <div className="room-meta">
                    <span className="customer-name">{room?.userId?.name || 'Unknown User'}</span>
                    <div className="room-badges">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(room.status) }}
                      >
                        {room.status === 'open' && 'Mở'}
                        {room.status === 'assigned' && 'Đã gán'}
                        {room.status === 'resolved' && 'Đã giải quyết'}
                        {room.status === 'closed' && 'Đã đóng'}
                      </span>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(room.priority) }}
                      >
                        {room.priority === 'high' && 'Cao'}
                        {room.priority === 'medium' && 'Trung bình'}
                        {room.priority === 'low' && 'Thấp'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="room-arrow">→</div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Staff Performance - Admin only */}
      {user?.role === 'admin' && statistics?.staff && (
        <div className="staff-performance-section">
          <div className="section-header">
            <h2>Hiệu suất Nhân viên</h2>
          </div>
          
          <div className="staff-list">
            {statistics.staff.map((staff) => (
              <div key={staff.id} className="staff-card">
                <div className="staff-avatar">
                  {staff?.avatar_url ? (
                    <img src={staff.avatar_url} alt={staff.name || 'Staff'} />
                  ) : (
                    <div className="avatar-placeholder">
                      {staff?.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  )}
                </div>
                
                <div className="staff-info">
                  <h3>{staff.name || 'Unknown Staff'}</h3>
                  <div className="staff-stats">
                    <span>{staff.roomCount} phòng</span>
                    <span>•</span>
                    <span>{staff.resolvedCount} đã giải quyết</span>
                    <span>•</span>
                    <span>{staff.resolutionRate}% thành công</span>
                  </div>
                </div>
                
                <div className="resolution-rate">
                  <div className="rate-bar">
                    <div 
                      className="rate-fill"
                      style={{ width: `${staff.resolutionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDashboard;