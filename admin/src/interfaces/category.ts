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
<<<<<<< HEAD
=======
  categoryType: string | import("./categoryType").default;
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
}
