import api from "../configs/api";
import Product from "../interfaces/product";

export const getAllProducts = async (
  showDeleted = false
): Promise<Product[]> => {
  try {
    const response = await api.get(
      `/products${showDeleted ? "?showDeleted=true" : ""}`
    );
    return response.data as Product[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getProductById = async (
  id: string
): Promise<Product | undefined> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data as Product;
  } catch (error) {
    console.log(error);
  }
};

export const getProductsByCategory = async (
  categoryId: string
): Promise<Product[]> => {
  try {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data as Product[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

<<<<<<< HEAD
=======
export const getProductsByCategoryType = async (
  type: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}> => {
  try {
    const response = await api.get(
      `/products/category-type/${type}?page=${page}&limit=${limit}`
    );
    return response.data as {
      success: boolean;
      data: Product[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      message: string;
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
export const createProduct = async (product: {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  status?: "active" | "inactive" | "out_of_stock";
  image_url?: string;
  images?: string[];
  category_id: string;
}): Promise<Product | undefined> => {
  try {
    const response = await api.post("/products", product);
    return response.data as Product;
  } catch (error) {
    console.log(error);
  }
};

export const updateProduct = async (
  id: string,
  product: Partial<Omit<Product, "_id" | "createdAt" | "updatedAt">> & {
    images?: string[];
  }
): Promise<Product | undefined> => {
  try {
    const response = await api.put(`/products/${id}`, product);
    return response.data as Product;
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
<<<<<<< HEAD
=======

export const restoreProduct = async (id: string) => {
  try {
    const response = await api.patch(`/products/${id}/restore`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
