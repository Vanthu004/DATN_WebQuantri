export default interface Product {
  _id: string;
  product_id: string;
  name: string;
  price: number;
  description: string;
  stock_quantity: number;
  status: string;
  category_id: string | { _id: string; name: string };
  image_url: string;
  sold_quantity: number;
  category: string;
  created_date: string;
}
