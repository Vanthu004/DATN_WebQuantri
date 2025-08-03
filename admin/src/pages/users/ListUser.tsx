import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import User from "../../interfaces/user";
import { toast } from "react-toastify";
import "../../css/users/listUser.css";
import api from "../../configs/api";
import { blockUser } from "../../services/user";



const ListUser = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<string>("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token đăng nhập");
      const res = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data as User[]);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Lỗi khi lấy danh sách người dùng");
      } else {
        toast.error("Lỗi khi lấy danh sách người dùng");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlock = async (id: string) => {
    setShowModal(id);
  };

  const confirmBlock = async (id: string) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Không tìm thấy token đăng nhập");

      
      const banData = {
        isBanned: true,
        bannedUntil: banDuration ? new Date(banDuration).toISOString() : null,
        reason: banReason || "",
      };

      await blockUser(id, banData, token);
      toast.success("Đã chặn người dùng");
      await fetchUsers();
      setShowModal(null);
      setBanReason("");
      setBanDuration("");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Thao tác thất bại");
      } else {
        toast.error("Thao tác thất bại");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn mở chặn người dùng này?")) return;

    setActionLoading(id);
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Không tìm thấy token đăng nhập");

      const banData = {
        isBanned: false,
        bannedUntil: null,
        reason: "",
      };

      await blockUser(id, banData, token);
      toast.success("Đã mở chặn người dùng");
      await fetchUsers();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Thao tác thất bại");
      } else {
        toast.error("Thao tác thất bại");
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2 className="user-list-title">Danh sách người dùng</h2>
        <div className="user-list-actions">
          <button 
            className="user-action-btn manage-roles"
            onClick={() => navigate('/users/manage')}
          >
            👑 Quản lý quyền
          </button>
        </div>
      </div>
      
      {/* Thống kê nhanh */}
      <div className="user-stats">
        <div className="stat-item">
          <span className="stat-number">{users.length}</span>
          <span className="stat-label">Tổng người dùng</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
          <span className="stat-label">Admin</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{users.filter(u => u.role === 'customer').length}</span>
          <span className="stat-label">Khách hàng</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{users.filter(u => u.ban?.isBanned).length}</span>
          <span className="stat-label">Bị khóa</span>
        </div>
      </div>
      
      <div className="user-list-table-wrap">
        <table className="user-list-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Tên</th>
              <th>Vai trò</th>
              <th>Số điện thoại</th>
              <th>Trạng thái</th>
              <th>Thời hạn chặn</th>
              <th>Lý do</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user._id} className="user-row">
                <td>{idx + 1}</td>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>{user.phone_number || "-"}</td>
                <td>
                  {user.ban.isBanned ? (
                    <span className="user-badge blocked">Đã chặn</span>
                  ) : (
                    <span className="user-badge active">Hoạt động</span>
                  )}
                </td>
                <td>
                  {user.ban.bannedUntil
                    ? new Date(user.ban.bannedUntil).toLocaleString()
                    : "-"}
                </td>

                <td>{user.ban.reason || "-"}</td>
                <td>
                  {user.ban.isBanned ? (
                    <button
                      className="user-action-btn unblock"
                      onClick={() => handleUnblock(user._id)}
                      disabled={actionLoading === user._id}
                    >
                      {actionLoading === user._id ? "Đang xử lý..." : "Mở chặn"}
                    </button>
                  ) : (
                    <button
                      className="user-action-btn block"
                      onClick={() => handleBlock(user._id)}
                      disabled={actionLoading === user._id}
                    >
                      {actionLoading === user._id ? "Đang xử lý..." : "Chặn"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="user-list-loading">Đang tải...</div>}
      </div>

      {/* Modal để nhập lý do và thời hạn ban */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Chặn người dùng</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Lý do chặn
              </label>
              <textarea
                className="mt-1 w-full p-2 border rounded"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Nhập lý do chặn (không bắt buộc)"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Thời hạn chặn (không bắt buộc)
              </label>
              <input
                type="datetime-local"
                className="mt-1 w-full p-2 border rounded"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowModal(null);
                  setBanReason("");
                  setBanDuration("");
                }}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => confirmBlock(showModal)}
                disabled={actionLoading === showModal}
              >
                {actionLoading === showModal ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListUser;
