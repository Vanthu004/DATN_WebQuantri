import api from "../configs/api";
import Order from "../interfaces/order";

// Lấy tất cả đơn hàng với pagination và filter
export const getAllOrders = async (
  status?: string,
  payment_status?: string,
  shipping_status?: string,
  page: number = 1,
  limit: number = 10,
  sort: string = "-createdAt"
): Promise<{
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (payment_status) params.append('payment_status', payment_status);
    if (shipping_status) params.append('shipping_status', shipping_status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sort', sort);

    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error getting all orders:", error);
    throw error;
  }
};

// Lấy đơn hàng theo ID
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error getting order by id:", error);
    throw error;
  }
};

// Lấy đơn hàng của user
export const getOrdersByUser = async (
  userId: string,
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/orders/user/${userId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error getting orders by user:", error);
    throw error;
  }
};

// Tạo đơn hàng mới
export const createOrder = async (orderData: {
  user_id: string;
  total_price: number;
  shippingmethod_id: string;
  paymentmethod_id: string;
  shipping_address: string;
  note?: string;
}): Promise<{
  success: boolean;
  msg: string;
  data: Order;
}> => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Cập nhật đơn hàng
export const updateOrder = async (
  id: string,
  updateData: Partial<Order>
): Promise<{
  success: boolean;
  msg: string;
  data: Order;
}> => {
  try {
    const response = await api.put(`/orders/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

// Xóa đơn hàng (soft delete)
export const deleteOrder = async (id: string): Promise<{
  success: boolean;
  msg: string;
}> => {
  try {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// Tạo đơn hàng với chi tiết
export const createOrderWithDetails = async (orderData: {
  user_id: string;
  total_price: number;
  shippingmethod_id: string;
  paymentmethod_id: string;
  shipping_address: string;
  note?: string;
  orderDetails: Array<{
    product_id: string;
    product_variant_id?: string;
    quantity: number;
    price_each: number;
  }>;
}): Promise<{
  success: boolean;
  msg: string;
  data: {
    order: Order;
    orderDetails: any[];
  };
}> => {
  try {
    const response = await api.post("/orders/with-details", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order with details:", error);
    throw error;
  }
};
