import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import  User  from '../../interfaces/user';
import '../../css/support/Support.css';

interface Message {
  _id: string | number;
  text: string;
  image: string | null;
  createdAt: string;
  user: { _id: string; name: string; avatar: string };
}

interface UserWithMessages extends User {
  latestMessage?: Message;
}

interface ConversationsResponse {
  message: string;
  data: UserWithMessages[];
}

const Support: React.FC = () => {
  const [users, setUsers] = useState<UserWithMessages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Vui lòng đăng nhập lại');
          return;
        }

        // Lấy danh sách user đã nhắn tin với admin
        const response = await axios.get<ConversationsResponse>(
          'http://localhost:3000/api/users/messages/conversations',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsers(response.data.data);
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        toast.error('Lỗi khi lấy danh sách người dùng: ' + errorMessage);
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="support-container">
      <h1 className="support-title">Hỗ trợ người dùng</h1>
      {loading ? (
        <p className="support-loading">Đang tải...</p>
      ) : (
        <div className="support-user-list">
          {users.length === 0 ? (
            <p className="support-empty">Không có người dùng nào đã nhắn tin.</p>
          ) : (
            users.map((user) => (
              <Link to={`/support/${user._id}`} key={user._id} className="support-user-item">
                <img
                  src={user.avata_url || 'https://api.dicebear.com/9.x/avataaars/svg'}
                  alt={user.name}
                  className="support-user-avatar"
                />
                <div className="support-user-info">
                  <div className="support-user-header">
                    <h3 className="support-user-name">{user.name}</h3>
                    <span className="support-user-time">
                      {user.latestMessage
                        ? new Date(user.latestMessage.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                  <div className="support-user-footer">
                    <p className="support-user-message">
                      {user.ban.isBanned
                        ? `Bị khóa: ${user.ban.reason || 'Không rõ lý do'}`
                        : user.latestMessage
                        ? user.latestMessage.text || 'Đã gửi một ảnh'
                        : 'Chưa có tin nhắn'}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Support;