import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../configs/api";
import "../../css/notify/sendNotification.css";

interface User {
  _id: string;
  name: string;
  email: string;
  token_device?: string;
  expo_push_token?: string;
  push_token_type?: 'fcm' | 'expo';
  role?: string;
}

interface NotificationForm {
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface GroupFilter {
  role?: string;
  hasToken?: boolean;
}

const SendNotification = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [notificationType, setNotificationType] = useState<'single' | 'bulk' | 'group'>('single');
  const [formData, setFormData] = useState<NotificationForm>({
    title: '',
    body: '',
    data: {}
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>({
    role: '',
    hasToken: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, groupFilter, notificationType]);

  const fetchUsers = async () => {
    try {
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
        return;
      }

      const response = await api.get('/users');
      // API trả về trực tiếp array users, không có wrapper data
      const userData = response.data;
      console.log('Fetched users:', userData);
      setUsers(userData);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      if (error.response?.status === 401) {
        setMessage('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setMessage('Không thể tải danh sách người dùng: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter theo role nếu có
    if (groupFilter.role) {
      filtered = filtered.filter(user => user.role === groupFilter.role);
    }

    // Filter theo token nếu có
    if (groupFilter.hasToken) {
      filtered = filtered.filter(user => 
        (user.token_device && user.token_device.trim() !== '') ||
        (user.expo_push_token && user.expo_push_token.trim() !== '')
      );
    }

    setFilteredUsers(filtered);
    
    // Reset selected users nếu không còn trong filtered list
    setSelectedUsers(prev => prev.filter(id => 
      filtered.some(user => user._id === id)
    ));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const handleNotificationTypeChange = (type: 'single' | 'bulk' | 'group') => {
    setNotificationType(type);
    setSelectedUsers([]); // Reset selection when changing type
    
    // Reset group filter for non-group types
    if (type !== 'group') {
      setGroupFilter({ role: '', hasToken: true });
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setMessage('Vui lòng nhập tiêu đề thông báo');
      return false;
    }

    if (!formData.body.trim()) {
      setMessage('Vui lòng nhập nội dung thông báo');
      return false;
    }

    if (notificationType === 'single') {
      if (selectedUsers.length !== 1) {
        setMessage('Vui lòng chọn đúng 1 người dùng cho thông báo đơn lẻ');
        return false;
      }
    } else if (notificationType === 'bulk') {
      if (selectedUsers.length === 0) {
        setMessage('Vui lòng chọn ít nhất 1 người dùng');
        return false;
      }
    } else if (notificationType === 'group') {
      if (filteredUsers.length === 0) {
        setMessage('Không có người dùng nào phù hợp với bộ lọc hiện tại');
        return false;
      }
    }

    return true;
  };

  const sendNotification = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      let response;
      let targetUsers = selectedUsers;

      // For group notification, use all filtered users
      if (notificationType === 'group') {
        targetUsers = filteredUsers.map(user => user._id);
      }

      if (notificationType === 'single') {
        response = await api.post('/notifications/send-notification', {
          id: targetUsers[0],
          title: formData.title.trim(),
          body: formData.body.trim(),
          data: formData.data || {}
        });
      } else {
        response = await api.post('/notifications/send-bulk-notification', {
          userIds: targetUsers,
          title: formData.title.trim(),
          body: formData.body.trim(),
          data: formData.data || {}
        });
      }

      const successMessage = notificationType === 'single' 
        ? 'Gửi thông báo thành công!'
        : `Gửi thông báo thành công cho ${targetUsers.length} người dùng!`;

      setMessage(successMessage);
      setFormData({ title: '', body: '', data: {} });
      setSelectedUsers([]);
    } catch (error: any) {
      console.error('Error sending notification:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi thông báo';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getTokenInfo = (user: User) => {
    if (user.push_token_type === 'expo' && user.expo_push_token) {
      return 'Expo Token';
    } else if (user.push_token_type === 'fcm' && user.token_device) {
      return 'FCM Token';
    }
    return 'Không có token';
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'staff': return 'Nhân viên';
      case 'user': return 'Người dùng';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Gửi thông báo cho người dùng</h2>
            <p className="text-gray-600">Gửi thông báo push đến người dùng</p>
          </div>
          <button
            onClick={() => navigate('/notify')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {/* Notification Type Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Loại thông báo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleNotificationTypeChange('single')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              notificationType === 'single'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium">Thông báo đơn lẻ</div>
              <div className="text-sm text-gray-500">Gửi cho 1 người dùng</div>
            </div>
          </button>

          <button
            onClick={() => handleNotificationTypeChange('bulk')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              notificationType === 'bulk'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">Thông báo hàng loạt</div>
              <div className="text-sm text-gray-500">Gửi cho nhiều người dùng</div>
            </div>
          </button>

          <button
            onClick={() => handleNotificationTypeChange('group')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              notificationType === 'group'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📢</div>
              <div className="font-medium">Thông báo theo nhóm</div>
              <div className="text-sm text-gray-500">Gửi cho nhóm cụ thể</div>
            </div>
          </button>
        </div>
      </div>

      {/* Group Filter (only for group notification) */}
      {notificationType === 'group' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Bộ lọc nhóm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò
              </label>
              <select
                value={groupFilter.role}
                onChange={(e) => setGroupFilter(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả vai trò</option>
                <option value="user">Người dùng</option>
                <option value="staff">Nhân viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái token
              </label>
              <select
                value={groupFilter.hasToken ? 'true' : 'false'}
                onChange={(e) => setGroupFilter(prev => ({ ...prev, hasToken: e.target.value === 'true' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Có token thông báo</option>
                <option value="false">Tất cả người dùng</option>
              </select>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Tìm thấy {filteredUsers.length} người dùng phù hợp
          </div>
        </div>
      )}

      {/* Notification Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Nội dung thông báo</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề thông báo *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề thông báo..."
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 ký tự
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung thông báo *
            </label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập nội dung thông báo..."
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.body.length}/500 ký tự
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dữ liệu tùy chỉnh (JSON)
            </label>
            <textarea
              name="data"
              value={JSON.stringify(formData.data, null, 2)}
              onChange={(e) => {
                try {
                  const data = JSON.parse(e.target.value);
                  setFormData(prev => ({ ...prev, data }));
                } catch (error) {
                  // Ignore invalid JSON
                }
              }}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{"type": "promotion", "action": "open_app"}'
            />
            <div className="text-xs text-gray-500 mt-1">
              Dữ liệu tùy chỉnh sẽ được gửi kèm thông báo
            </div>
          </div>
        </div>

        {/* Preview */}
        {(formData.title || formData.body) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Xem trước thông báo:</h4>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">{formData.title || 'Tiêu đề thông báo'}</div>
              <div className="text-sm text-gray-600 mt-1">{formData.body || 'Nội dung thông báo'}</div>
            </div>
          </div>
        )}
      </div>

      {/* User Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {notificationType === 'group' ? 'Danh sách người dùng' : 'Chọn người dùng'}
          </h3>
          {notificationType !== 'group' && (
            <button
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {selectedUsers.length === filteredUsers.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div
                key={user._id}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedUsers.includes(user._id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => notificationType !== 'group' && handleUserSelection(user._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {notificationType !== 'group' && (
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserSelection(user._id)}
                        className="mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">
                        {getRoleLabel(user.role)} • {getTokenInfo(user)}
                      </div>
                    </div>
                  </div>
                  {notificationType === 'group' && (
                    <div className="text-xs text-gray-400">
                      Sẽ nhận thông báo
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              Không có người dùng nào phù hợp
            </div>
          )}
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          {notificationType === 'group' 
            ? `Sẽ gửi thông báo cho ${filteredUsers.length} người dùng`
            : `Đã chọn ${selectedUsers.length} người dùng`
          }
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('thành công') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Send Button */}
      <div className="flex justify-center">
        <button
          onClick={sendNotification}
          disabled={loading || (notificationType !== 'group' && selectedUsers.length === 0)}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            loading || (notificationType !== 'group' && selectedUsers.length === 0)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Đang gửi...' : '📤 Gửi thông báo'}
        </button>
      </div>
    </div>
  );
};

export default SendNotification;
