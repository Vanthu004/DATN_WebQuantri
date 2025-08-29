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
    role?: "admin" | "staff" | "user";
  },
  token?: string
) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return api.put(`/users/${id}`, user, { headers });
};

// Hàm cập nhật role cho user
export const updateUserRole = async (
  id: string,
  role: "admin" | "staff" | "user",
  token: string
) => {
  // Log request data for debugging
  console.log("Updating user role with:", {
    id,
    role,
    hasToken: !!token,
  });

  try {
    const response = await api.patch(
      `/users/${id}/role`,
      { role: role }, // Ensure role is sent as an object
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error: any) {
    console.error("Update role error:", error.response?.data || error.message);
    throw error;
  }
};

// Hàm lấy danh sách toàn bộ user
export const getAllUsers = async () => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await api.get("/users/all", { headers });
  return res.data; // giả sử API trả về mảng user
};
// Lấy danh sách user có role = "user"
export const getAllUsersByRole = async () => {
  const res = await api.get("/users/roleUser"); // không gửi token
  return res.data; // API trả về mảng user
};