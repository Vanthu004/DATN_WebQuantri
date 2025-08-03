// admin/src/services/user.ts
import api from "../configs/api";

export const blockUser = async (
  id: string,
  banData: {
    isBanned: boolean;
    bannedUntil?: string | null;
    reason?: string;
  },
  token: string
) => {
  return api.patch(`/users/${id}/block`, banData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateUser = async (
  id: string,
  user: {
    name?: string;
    phone_number?: string;
    address?: string;
    avatar?: string;
  }
) => {
  return api.put(`/users/${id}`, user);
};
// Hàm lấy danh sách toàn bộ user
export const getAllUsers = async () => {
  const res = await api.get("/users/all");
  return res.data; // giả sử API trả về mảng user
};

