import api from "../configs/api";

export const blockUser = async (id: string, block: boolean, token: string) => {
  return api.patch(
    `/users/${id}/block`,
    { block },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Nếu có chức năng update user:
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
