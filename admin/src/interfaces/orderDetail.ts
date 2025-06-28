export default interface OrderDetail {
  _id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  price_each: number;
  product_name: string;
  product_price: number;
  createdAt?: string;
  updatedAt?: string;
}
