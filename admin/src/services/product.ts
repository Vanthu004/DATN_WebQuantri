import api from "../configs/api";
import Product from "../interfaces/product";

export const getAllProducts = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getProductById = async (id: string) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getProductsByCategory = async (categoryId: string) => {
  try {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const createProduct = async (product: {
  product_id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  status?: string;
  image_url?: string;
  category_id: string;
}) => {
  try {
    const response = await api.post("/products", product);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateProduct = async (id: string, product: Product) => {
  try {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
