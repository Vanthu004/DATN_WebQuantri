import api from "../configs/api";
import OrderDetail from "../interfaces/orderDetail";
import Order from "../interfaces/order";

// Tạo mới order detail
export const createOrderDetail = async (
  data: Omit<OrderDetail, "_id" | "createdAt" | "updatedAt">
): Promise<OrderDetail> => {
  const res = await api.post<OrderDetail>("/order-details", data);
  return res.data;
};

// Lấy tất cả order detail
export const getAllOrderDetails = async (): Promise<OrderDetail[]> => {
  const res = await api.get<OrderDetail[]>("/order-details");
  return res.data;
};

// Lấy order detail theo id
export const getOrderDetailById = async (id: string): Promise<OrderDetail> => {
  const res = await api.get<OrderDetail>(`/order-details/${id}`);
  return res.data;
};

// Lấy order detail theo order_id
export const getOrderDetailsByOrderId = async (
  orderId: string
): Promise<OrderDetail[]> => {
  const res = await api.get<OrderDetail[]>(`/order-details/order/${orderId}`);
  return res.data;
};

// Xóa order detail
export const deleteOrderDetail = async (
  id: string
): Promise<{ msg: string }> => {
  const res = await api.delete<{ msg: string }>(`/order-details/${id}`);
  return res.data;
};

export interface OrderDetailFull
  extends Omit<OrderDetail, "order_id" | "product_id"> {
  order_id: Order;
  product_id: { _id: string; name: string; price: number };
}

// Lấy order detail đầy đủ theo id (kèm order, product)
export const getOrderDetailFullById = async (
  id: string
): Promise<OrderDetailFull> => {
  const res = await api.get<OrderDetailFull>(`/order-details/${id}/full`);
  return res.data;
};
