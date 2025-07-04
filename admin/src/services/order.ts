import api from "../configs/api";
import Order from "../interfaces/order";

// Lấy tất cả đơn hàng
export const getAllOrders = async (): Promise<Order[]> => {
  const res = await api.get<Order[]>("/orders");
  return res.data;
};

// Lấy đơn hàng theo ID
export const getOrderById = async (id: string): Promise<Order> => {
  const res = await api.get<Order>(`orders/${id}`);
  return res.data;
};

// Tạo đơn hàng mới
export const createOrder = async (
  order: Omit<Order, "_id" | "order_code" | "createdAt" | "updatedAt">
): Promise<Order> => {
  const res = await api.post<Order>(`orders/`, order);
  return res.data;
};

// Cập nhật đơn hàng
export const updateOrder = async (
  id: string,
  data: Partial<Order>
): Promise<Order> => {
  const res = await api.put<Order>(`orders/${id}`, data);
  return res.data;
};

// Xóa đơn hàng
export const deleteOrder = async (id: string): Promise<{ msg: string }> => {
  const res = await api.delete<{ msg: string }>(`orders/${id}`);
  return res.data;
};

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  const res = await api.get<Order[]>(`orders/user/${userId}`);
  return res.data;
};
