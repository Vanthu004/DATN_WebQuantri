import api from '../configs/api';
import { Color } from '../interfaces/color';

const API_URL = '/colors';

export const getAllColors = async (): Promise<Color[]> => {
  const res = await api.get(API_URL);
  return res.data as Color[];
};

export const getColorById = async (id: string): Promise<Color> => {
  const res = await api.get(`${API_URL}/${id}`);
  return res.data as Color;
};

export const createColor = async (data: Partial<Color>): Promise<Color> => {
  const res = await api.post(API_URL, data);
  return res.data as Color;
};

export const updateColor = async (id: string, data: Partial<Color>): Promise<Color> => {
  const res = await api.put(`${API_URL}/${id}`, data);
  return res.data as Color;
};

export const softDeleteColor = async (id: string): Promise<{ message: string; color?: Color }> => {
  const res = await api.patch(`${API_URL}/${id}/soft-delete`);
  return res.data as { message: string; color?: Color };
};

export const restoreColor = async (id: string): Promise<{ message: string; color?: Color }> => {
  const res = await api.patch(`${API_URL}/${id}/restore`);
  return res.data as { message: string; color?: Color };
};
