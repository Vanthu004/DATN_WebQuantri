export default interface Order {
  _id: string;
  user_id: string | { _id: string; name: string; email?: string; phone_number?: string; address?: string };
  status: string;
  total_price: number;
  shippingmethod_id: string | { _id: string; name: string; price?: number; description?: string; estimated_days?: number };
  paymentmethod_id: string | { _id: string; name: string; description?: string; code?: string };
  voucher_id?: string | { _id: string; title: string; discount_value: number; voucher_id: string };
  is_paid: boolean;
  shipping_address: string;
  order_code: string;
  note?: string;
  
  // Các trường mới từ backend
  payment_status?: "pending" | "paid" | "failed" | "refunded";
  shipping_status?: "pending" | "shipped" | "delivered" | "returned";
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  
  // Virtual fields
  item_count?: number;
  total_quantity?: number;
  has_variants?: boolean;
  status_display?: string;
  
  // Order details (populated)
  order_details?: OrderDetail[];
  
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderDetail {
  _id: string;
  order_id: string | Order;
  product_id: string | { _id: string; name: string; image_url?: string; status?: string; description?: string };
  product_variant_id?: string | {
    _id: string;
    sku?: string;
    price?: number;
    image_url?: string;
    attributes?: {
      size?: { _id: string; name: string };
      color?: { _id: string; name: string };
    };
  };
  quantity: number;
  price_each: number;
  product_name: string;
  product_price: number;
  product_image?: string;
  
  // Thông tin biến thể (lưu trực tiếp)
  variant_info?: {
    size?: { _id: string; name: string };
    color?: { _id: string; name: string };
    sku?: string;
  };
  
  // Trạng thái item
  status?: "active" | "cancelled" | "returned";
  
  // Virtual fields
  total_price?: number;
  variant_display?: string;
  has_variant?: boolean;
  
  createdAt?: string;
  updatedAt?: string;
}
