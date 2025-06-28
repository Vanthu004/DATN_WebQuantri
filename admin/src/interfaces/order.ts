export default interface Order {
  _id: string;
  user_id: string;
  status: string;
  total_price: number;
  shipmethod_id: string;
  paymethod_id: string;
  is_paid: boolean;
  shipping_address: string;
  order_code: string;
  createdAt?: string;
  updatedAt?: string;
}
