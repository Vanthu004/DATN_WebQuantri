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
