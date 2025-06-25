import api from "../configs/api";

export const getAllCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getCategoryById = async (id: string) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const createCategory = async (category: { name: string }) => {
  try {
    const response = await api.post("/categories", category);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateCategory = async (
  id: string,
  category: { name: string }
) => {
  try {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
