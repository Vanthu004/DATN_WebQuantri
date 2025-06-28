import Upload from "./upload";

export default interface User {
  _id: string;
  email: string;
  password?: string;
  name: string;
  role: "admin" | "customer" | "user";
  phone_number?: string;
  avatar?: Upload | string;
  avata_url?: string;
  address?: string;
  token_device?: string;
  is_blocked: boolean;
  createdAt: string;
  updatedAt: string;
}
