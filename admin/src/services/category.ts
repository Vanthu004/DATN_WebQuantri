import api from "../configs/api";
import Category from "../interfaces/category";

export const getAllCategories = async (
  showDeleted = false
): Promise<Category[]> => {
  try {
    const response = await api.get(
      `/categories${showDeleted ? "?showDeleted=true" : ""}`
    );
    return response.data as Category[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getCategoryById = async (
  id: string
): Promise<Category | undefined> => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data as Category;
  } catch (error) {
    console.log(error);
  }
};

export const createCategory = async (
  category: Omit<Category, "_id" | "createdAt" | "updatedAt"> & {
    image?: string;
    categoryType: string;
  }
): Promise<Category | undefined> => {
  try {
    const response = await api.post("/categories", category);
    return response.data as Category;
  } catch (error) {
    console.log(error);
  }
};

export const updateCategory = async (
  id: string,
  category: Partial<Omit<Category, "_id" | "createdAt" | "updatedAt">> & {
    image?: string;
    categoryType: string;
  }
): Promise<Category | undefined> => {
  try {
    const response = await api.put(`/categories/${id}`, category);
    return response.data as Category;
  } catch (error) {
    console.log(error);
  }
};

export const deleteCategory = async (
  id: string
): Promise<{ message: string; cat: Category } | undefined> => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data as { message: string; cat: Category };
  } catch (error) {
    console.log(error);
  }
};

export const updateSortOrders = async (
  orders: { _id: string; sort_order: number }[]
): Promise<{ message: string } | undefined> => {
  try {
    const response = await api.put('/categories/sort-orders', { orders });
    return response.data as { message: string };
  } catch (error) {
    console.log(error);
  }
};
