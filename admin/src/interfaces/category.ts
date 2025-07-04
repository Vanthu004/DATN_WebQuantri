import Upload from "./upload";

export default interface Category {
  _id: string;
  name: string;
  status: "active" | "inactive";
  image?: Upload | string;
  image_url?: string;
  sort_order: number;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  categoryType: string | import("./categoryType").default;
}
