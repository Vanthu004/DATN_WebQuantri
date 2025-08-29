import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { chatApi, ChatRoomsResponse } from '../../services/chatApi';
import { ChatRoom, Message } from '../../interfaces/chat';
import { toast } from 'react-toastify';
import '../../css/chat/chatRoomsList.css';

interface User {
  role: string;
}

const ChatRoomsList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState<ChatRoomsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    priority: searchParams.get('priority') || '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ role: payload.role || 'staff' });
      } catch (error) {
        console.error('Error parsing token:', error);
        toast.error('Không thể xác thực người dùng');
      }
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [user, filters, currentPage]);

  const loadRooms = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let roomsData;
      const params = {
        ...filters,
        page: currentPage,
        limit: pageSize,
      };

      if (user.role === 'admin') {
        roomsData = await chatApi.getAllChatRooms(params);
      } else {
        roomsData = await chatApi.getAssignedChatRooms(params);
      }

      setRooms(roomsData);
    } catch (error) {
      console.error('Load rooms error:', error);
      toast.error('Không thể tải danh sách phòng chat');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
    });
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'product_inquiry': return 'Hỏi sản phẩm';
      case 'order_support': return 'Hỗ trợ đơn hàng';
      case 'complaint': return 'Khiếu nại';
      case 'general': return 'Tổng quát';
      default: return category;
    }
  };

  if (loading) {
    return (
      <div className="chat-rooms-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách phòng chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-rooms-list">
      <div className="page-header">
        <div className="header-left">
          <h1>
            {user?.role === 'admin' ? 'Tất cả phòng chat' : 'Phòng được gán'}
          </h1>
          <p className="subtitle">
            {rooms?.pagination.total || 0} phòng chat
          </p>
        </div>
        <div className="header-actions">
          <Link to="/chat/dashboard" className="btn btn-outline">
            ← Quay lại Dashboard
          </Link>
        </div>
      </div>
      {user?.role === 'admin' && (
        <div className="filters-bar">
          <div className="filter-group">
            <label>Trạng thái:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="open">Mở</option>
              <option value="assigned">Đã gán</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Danh mục:</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="product_inquiry">Hỏi sản phẩm</option>
              <option value="order_support">Hỗ trợ đơn hàng</option>
              <option value="complaint">Khiếu nại</option>
              <option value="general">Tổng quát</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Ưu tiên:</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>

          <button
            className="btn btn-outline"
            onClick={() => {
              setFilters({ status: '', category: '', priority: '' });
              setSearchParams(new URLSearchParams());
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      <div className="rooms-container">
        {rooms?.chatRooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>Không có phòng chat nào</h3>
            <p>
              {user?.role === 'admin'
                ? 'Chưa có phòng chat nào được tạo.'
                : 'Bạn chưa được gân phòng chat nào.'}
            </p>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms?.chatRooms.map((room) => (
              <Link
                key={room._id}
                to={`/chat/room/${room.roomId}`}
                className="room-card"
              >
                <div className="room-header">
                  <div className="customer-info">
                    <div className="customer-avatar">
                      {room.userId && room.userId.avatar_url ? (
                        <img
                          src={room.userId.avatar_url}
                          alt={room.userId.name || 'Người dùng'}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {(room.userId?.name?.charAt(0) || '?').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="customer-details">
                      <h3 className="customer-name">
                        {room.userId?.name || 'Người dùng ẩn danh'}
                      </h3>
                      <p className="customer-email">
                        {room.userId?.email || 'Không có email'}
                      </p>
                    </div>
                  </div>

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
                      {room.priority === 'medium' && 'TB'}
                      {room.priority === 'low' && 'Thấp'}
                    </span>
                  </div>
                </div>

                <div className="room-content">
                  <h4 className="room-subject">{room.subject}</h4>
                  <p className="room-category">
                    {getCategoryLabel(room.category)}
                  </p>
                  {room.assignedStaff && (
                    <div className="assigned-staff">
                      <span className="staff-label">Được gán cho:</span>
                      <span className="staff-name">{room.assignedStaff.name}</span>
                    </div>
                  )}
                </div>

                <div className="room-footer">
                  <span className="last-message-time">
                    {formatTimeAgo(room.lastMessageAt)}
                  </span>
                  <div className="room-arrow">→</div>
                </div>
              </Link>
            ))}
          </div>
        )}A
      </div>

      {rooms && rooms.pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ← Trước
          </button>

          <div className="pagination-info">
            Trang {currentPage} / {rooms.pagination.totalPages}
            ({rooms.pagination.total} phòng)
          </div>
          <button
            className="pagination-btn"
            disabled={currentPage === rooms.pagination.totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

// Error Boundary Component
import { Component, ReactNode } from 'react';

class ChatRoomsListErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in ChatRoomsList:', error, errorInfo);
    toast.error('Đã xảy ra lỗi khi hiển thị danh sách phòng chat');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-state">
          <h3>Đã xảy ra lỗi</h3>
          <p>Vui lòng làm mới trang hoặc thử lại sau.</p>
          <button
            className="btn btn-outline"
            onClick={() => window.location.reload()}
          >
            Làm mới
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap ChatRoomsList with ErrorBoundary
const WrappedChatRoomsList: React.FC = () => (
  <ChatRoomsListErrorBoundary>
    <ChatRoomsList />
  </ChatRoomsListErrorBoundary>
);

export default WrappedChatRoomsList;
