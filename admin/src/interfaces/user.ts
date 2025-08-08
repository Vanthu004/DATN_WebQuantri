//DATN_WebQuantri/admin/src/interfaces/user.ts
import Upload from "./upload";

export default interface User {
  _id: string;
  email: string;
  password?: string;
  name: string;
  role: "admin" | "customer" | "user";
  phone_number?: string;
  avatar?: Upload | string | null;
  avata_url?: string;
  address?: string;
  token_device?: string;
  gender?: string;
  email_verified?: boolean;
  email_verification_otp?: string | null;
  email_verification_expires?: string | null;
  ban: {
    isBanned: boolean;
    bannedUntil?: string | null;
    reason?: string;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
}