import api from '../configs/api';
import { Size } from '../interfaces/size';

const API_URL = '/sizes';

export const getAllSizes = async (): Promise<Size[]> => {
  const res = await api.get(API_URL);
  return res.data as Size[];
};

export const getSizeById = async (id: string): Promise<Size> => {
  const res = await api.get(`${API_URL}/${id}`);
  return res.data as Size;
};

export const createSize = async (data: Partial<Size>): Promise<Size> => {
  const res = await api.post(API_URL, data);
  return res.data as Size;
};

export const updateSize = async (id: string, data: Partial<Size>): Promise<Size> => {
  const res = await api.put(`${API_URL}/${id}`, data);
  return res.data as Size;
};

export const softDeleteSize = async (id: string): Promise<{ message: string; size?: Size }> => {
  const res = await api.patch(`${API_URL}/${id}/soft-delete`);
  return res.data as { message: string; size?: Size };
};

export const restoreSize = async (id: string): Promise<{ message: string; size?: Size }> => {
  const res = await api.patch(`${API_URL}/${id}/restore`);
  return res.data as { message: string; size?: Size };
};
