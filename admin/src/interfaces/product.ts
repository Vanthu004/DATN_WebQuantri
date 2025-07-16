import Upload from "./upload";

export interface Review {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  product_id: string;
  rating: number;
  comment: string;
  create_date: string;
}

export interface RatingStats {
  average: number;
  total: number;
  stats: { [key: number]: number };
  percentages: { [key: number]: number };
}

export default interface Product {
  _id: string;
  product_id: string;
  name: string;
  price: number;
  description: string;
  stock_quantity: number;
  stock?: number; // Alias cho stock_quantity
  status: "active" | "inactive" | "out_of_stock";
  category_id:
    | string
    | ({ _id: string; name: string } & Record<string, unknown>);
  category?: {
    _id: string;
    name: string;
    image_url?: string;
  };
  images?: (Upload | string)[];
  image_url: string;
  sold_quantity: number;
  views?: number;
  category_name?: string;
  category_type?: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Reviews và Rating
  reviews?: Review[];
  rating?: number;
  ratingCount?: number;
}
