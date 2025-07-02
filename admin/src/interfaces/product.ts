import Upload from "./upload";

export default interface Product {
  _id: string;
  product_id: string;
  name: string;
  price: number;
  description: string;
  stock_quantity: number;
  status: "active" | "inactive" | "out_of_stock";
  category_id:
    | string
    | ({ _id: string; name: string } & Record<string, unknown>);
  images?: (Upload | string)[];
  image_url: string;
  sold_quantity: number;
  views?: number;
  category_name?: string;
  category_type?: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}
