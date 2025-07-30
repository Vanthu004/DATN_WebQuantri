import api from "../configs/api";
import { OrderDetail } from "../interfaces/order";
import Order from "../interfaces/order";

// Tạo mới order detail
export const createOrderDetail = async (
  data: {
    order_id: string;
    product_id: string;
    product_variant_id?: string;
    quantity: number;
    price_each: number;
  }
): Promise<{
  success: boolean;
  msg: string;
  data: OrderDetail;
}> => {
  try {
    const response = await api.post("/order-details", data);
    return response.data;
  } catch (error) {
    console.error("Error creating order detail:", error);
    throw error;
  }
};

// Lấy tất cả order detail với pagination và filter
export const getAllOrderDetails = async (
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  success: boolean;
  data: {
    details: OrderDetail[];
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

    const response = await api.get(`/order-details?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error getting all order details:", error);
    throw error;
  }
};

// Lấy order detail theo id
export const getOrderDetailById = async (id: string): Promise<{
  success: boolean;
  data: OrderDetail;
}> => {
  try {
    const response = await api.get(`/order-details/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting order detail by id:", error);
    throw error;
  }
};

// Lấy order detail theo order_id
export const getOrderDetailsByOrderId = async (
  orderId: string,
  status?: string
): Promise<{
  success: boolean;
  data: {
    details: OrderDetail[];
    total_amount: number;
    item_count: number;
  };
}> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await api.get(`/order-details/order/${orderId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error getting order details by order id:", error);
    throw error;
  }
};

// Cập nhật order detail
export const updateOrderDetail = async (
  id: string,
  updateData: Partial<OrderDetail>
): Promise<{
  success: boolean;
  msg: string;
  data: OrderDetail;
}> => {
  try {
    const response = await api.put(`/order-details/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating order detail:", error);
    throw error;
  }
};

// Xóa order detail (soft delete)
export const deleteOrderDetail = async (
  id: string
): Promise<{
  success: boolean;
  msg: string;
}> => {
  try {
    const response = await api.delete(`/order-details/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting order detail:", error);
    throw error;
  }
};

export interface ProductVariantPopulated {
  _id: string;
  sku?: string;
  price?: number;
  image_url?: string;
  attributes?: {
    size?: { _id: string; name: string };
    color?: { _id: string; name: string };
  };
}

export interface OrderDetailFull
  extends Omit<OrderDetail, "order_id" | "product_id" | "product_variant_id"> {
  order_id: Order;
  product_id: { _id: string; name: string; price: number; image_url?: string; status?: string; description?: string };
  product_variant_id?: string | ProductVariantPopulated;
}

// Lấy order detail đầy đủ theo id (kèm order, product, variant)
export const getOrderDetailFullById = async (
  id: string
): Promise<{
  success: boolean;
  data: OrderDetailFull;
}> => {
  try {
    const response = await api.get(`/order-details/${id}/full`);
    return response.data;
  } catch (error) {
    console.error("Error getting order detail full by id:", error);
    throw error;
  }
};
