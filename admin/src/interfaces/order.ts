export default interface Order {
  _id: string;
  user_id: string | { _id: string; name: string; email?: string };
  status: string;
  total_price: number;
  shippingmethod_id: string | { _id: string; name: string };
  paymentmethod_id: string | { _id: string; name: string };
  is_paid: boolean;
  shipping_address: string;
  order_code: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}
