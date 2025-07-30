export default interface OrderDetail {
  _id: string;
  order_id: string;
  product_id: string | { _id: string; name: string; price: number };
  product_variant_id?: string | {
    _id: string;
    sku?: string;
    price?: number;
    image_url?: string;
    attributes?: {
      size?: { _id: string; name: string; code?: string };
      color?: { _id: string; name: string; code?: string; hex_code?: string };
    };
  };
  quantity: number;
  price_each: number;
  product_name: string;
  product_price: number;
  product_image?: string;
  createdAt?: string;
  updatedAt?: string;
}
