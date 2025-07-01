export default interface OrderDetail {
  _id: string;
  order_id: string;
  product_id: string | { _id: string; name: string; price: number };
  quantity: number;
  price_each: number;
  product_name: string;
  product_price: number;
  createdAt?: string;
  updatedAt?: string;
}
