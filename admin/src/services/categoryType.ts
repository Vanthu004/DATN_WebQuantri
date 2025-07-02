import api from "../configs/api";
import CategoryType from "../interfaces/categoryType";

export const getAllCategoryTypes = async (): Promise<CategoryType[]> => {
  const res = await api.get("/category-types");
  return res.data as CategoryType[];
};

export const createCategoryType = async (data: Omit<CategoryType, '_id' | 'createdAt' | 'updatedAt'>): Promise<CategoryType> => {
  const res = await api.post("/category-types", data);
  return res.data as CategoryType;
};

export const updateCategoryType = async (id: string, data: Partial<Omit<CategoryType, '_id' | 'createdAt' | 'updatedAt'>>): Promise<CategoryType> => {
  const res = await api.put(`/category-types/${id}`, data);
  return res.data as CategoryType;
};

export const deleteCategoryType = async (id: string): Promise<{ message: string }> => {
  const res = await api.delete(`/category-types/${id}`);
  return res.data as { message: string };
}; 