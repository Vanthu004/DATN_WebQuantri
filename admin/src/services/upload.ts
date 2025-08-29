import api from "../configs/api";

export interface UploadResponse {
  _id: string;
  url: string;
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data as UploadResponse; // { _id: string, url: string }
};