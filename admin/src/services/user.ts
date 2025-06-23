import api from "../configs/api";

export const blockUser = async (id: string, block: boolean, token: string) => {
  return api.patch(
    `/users/${id}/block`,
    { block },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
