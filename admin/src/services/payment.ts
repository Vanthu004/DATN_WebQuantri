import api from "../configs/api";

// Tính toán voucher discount cho thanh toán online
export const calculateVoucherForPayment = async (voucher_id: string, product_total: number) => {
  try {
    const res = await api.post('/payments/calculate-voucher', {
      voucher_id,
      product_total
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi tính toán voucher cho thanh toán:", error);
    throw error;
  }
};

// Tạo đơn hàng ZaloPay với voucher
export const createZaloPayOrder = async (orderData: {
  cart_id: string;
  items: any[];
  product_total: number;
  voucher_discount?: number;
  shipping_fee: number;
  app_user?: string;
}) => {
  try {
    const res = await api.post('/payments/zalopay/payment', orderData);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng ZaloPay:", error);
    throw error;
  }
};

// Kiểm tra trạng thái đơn hàng ZaloPay
export const checkZaloPayOrderStatus = async (app_trans_id: string) => {
  try {
    const res = await api.post('/payments/zalopay/check-status', {
      app_trans_id
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái ZaloPay:", error);
    throw error;
  }
}; 