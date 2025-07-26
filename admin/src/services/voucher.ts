import api from "../configs/api";

export interface VoucherData {
  _id?: string;
  voucher_id?: string;
  discount_value: number;
  usage_limit: number;
  expiry_date: string;
  User_id?: { _id: string; name?: string; email?: string } | string | null;
  used_count?: number;
  status?: "active" | "inactive" | "expired";
}

// Lấy tất cả vouchers (kể cả cá nhân & chung)
export const getAllVouchers = async (): Promise<VoucherData[]> => {
  const res = await api.get('/vouchers');
  return res.data as VoucherData[];
};
export const getVoucherByVoucherId = async (voucher_id: string): Promise<VoucherData[]> => {
  try {
    const res = await api.get(`/vouchers/voucher-by-id/${voucher_id}`);
    return res.data as VoucherData[];
  } catch (error) {
    console.error("Lỗi khi lấy voucher theo voucher_id:", error);
    throw error;
  }
};
// Tạo voucher (cá nhân hoặc dùng chung)
export const createVoucher = async (data: {
  discount_value: number;
  usage_limit: number;
  expiry_date: string;
  status?: "active" | "inactive" | "expired";
  isPersonal?: boolean; // true nếu muốn tạo cho tất cả user
}) => {
  const res = await api.post('/vouchers', data);
  return res.data;
};

// Cập nhật theo voucher_id (toàn bộ cá nhân dùng chung)
export const updateVoucherByVoucherId = async (
  voucher_id: string,
  data: Partial<VoucherData>
) => {
  const res = await api.put(`/vouchers/voucher-by-id/${voucher_id}`, data);
  return res.data;
};

// Xóa theo _id
export const deleteVoucher = async (id: string) => {
  const res = await api.delete(`/vouchers/${id}`);
  return res.data;
};

// Xóa toàn bộ theo voucher_id
export const deleteVoucherByVoucherId = async (voucher_id: string) => {
  const res = await api.delete(`/vouchers/voucher-by-id/${voucher_id}`);
  return res.data;
};
