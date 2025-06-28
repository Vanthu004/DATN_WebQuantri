import { useEffect, useState } from "react";
import User from "../../interfaces/user";
import { toast } from "react-toastify";
import "../../css/users/listUser.css";
import api from "../../configs/api";
import { blockUser } from "../../services/user";

const ListUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data as User[]);
    } catch (err) {
      toast.error("Lỗi khi lấy danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlock = async (id: string, block: boolean) => {
    try {
      const token = localStorage.getItem("token") || "";
      await blockUser(id, block, token);
      toast.success(block ? "Đã chặn người dùng" : "Đã mở chặn người dùng");
      fetchUsers();
    } catch (err) {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className="user-list-container">
      <h2 className="user-list-title">Danh sách người dùng</h2>
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
              <th>Ngày tạo</th>
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
                  {user.is_blocked ? (
                    <span className="user-badge blocked">Đã chặn</span>
                  ) : (
                    <span className="user-badge active">Hoạt động</span>
                  )}
                </td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : ""}
                </td>
                <td>
                  {user.is_blocked ? (
                    <button
                      className="user-action-btn unblock"
                      onClick={() => handleBlock(user._id, false)}
                    >
                      Mở chặn
                    </button>
                  ) : (
                    <button
                      className="user-action-btn block"
                      onClick={() => handleBlock(user._id, true)}
                    >
                      Chặn
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="user-list-loading">Đang tải...</div>}
      </div>
    </div>
  );
};

export default ListUser;
