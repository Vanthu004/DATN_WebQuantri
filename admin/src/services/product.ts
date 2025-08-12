import api from "../configs/api";
import Product from "../interfaces/product";

export interface Variant {
  _id: string;
  sku: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  is_active?: boolean;
  sort_order?: number;
  attributes: {
    size: string | { _id: string; name: string };
    color: string | { _id: string; name: string };
  };
  size_name?: string;
  color_name?: string;
  variant_key?: string;
}

// Interface cho dữ liệu sản phẩm tối ưu cho Frontend
export interface ProductForFrontend {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  status: "active" | "inactive" | "out_of_stock";
  image_url?: string;
  images?: string[];
  category_id: {
    _id: string;
    name: string;
  };
  has_variants: boolean;
  min_price: number;
  max_price: number;
  total_variants: number;
  available_sizes: Array<{ _id: string; name: string }>;
  available_colors: Array<{ _id: string; name: string }>;
  main_image: string;
  total_stock: number;
  variants: Array<{
    _id: string;
    sku: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
    is_active: boolean;
    sort_order: number;
    attributes: {
      size: { _id: string; name: string };
      color: { _id: string; name: string };
    };
    size_name: string;
    color_name: string;
    variant_key: string;
  }>;
  reviews: Array<{
    _id: string;
    user_id: { _id: string; name: string };
    rating: number;
    comment: string;
    created_at: string;
  }>;
  rating: number;
  ratingCount: number;
  sold_quantity: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export const getAllProducts = async (
  showDeleted = false,
  includeReviews = false,
  includeVariants = false
): Promise<Product[]> => {
  try {
    const params = new URLSearchParams();
    if (showDeleted) params.append('showDeleted', 'true');
    if (includeReviews) params.append('includeReviews', 'true');
    if (includeVariants) params.append('includeVariants', 'true');
    
    const response = await api.get(
      `/products${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data as Product[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getProductById = async (
  id: string,
  includeVariants = false
): Promise<Product | undefined> => {
  try {
    const params = new URLSearchParams();
    if (includeVariants) params.append('includeVariants', 'true');
    
    const response = await api.get(
      `/products/${id}${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data as Product;
  } catch (error) {
    console.log(error);
  }
};

// Hàm mới để lấy dữ liệu sản phẩm tối ưu cho Frontend
export const getProductForFrontend = async (
  id: string
): Promise<ProductForFrontend | undefined> => {
  try {
    const response = await api.get(`/products/${id}/frontend`);
    return response.data as ProductForFrontend;
  } catch (error) {
    console.log(error);
  }
};

export const getProductsByCategory = async (
  categoryId: string,
  includeReviews = false,
  includeVariants = false
): Promise<Product[]> => {
  try {
    const params = new URLSearchParams();
    if (includeReviews) params.append('includeReviews', 'true');
    if (includeVariants) params.append('includeVariants', 'true');
    
    const response = await api.get(
      `/products/category/${categoryId}${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data as Product[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getProductsByCategoryType = async (
  type: string,
  page: number = 1,
  limit: number = 20,
  includeVariants = false
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
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (includeVariants) params.append('includeVariants', 'true');
    
    const response = await api.get(
      `/products/category-type/${type}?${params.toString()}`
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

// Hàm mới để tìm kiếm sản phẩm với các bộ lọc nâng cao
export const searchProducts = async (
  searchTerm?: string,
  categoryId?: string,
  minPrice?: number,
  maxPrice?: number,
  hasVariants?: boolean,
  status?: "active" | "inactive" | "out_of_stock",
  page: number = 1,
  limit: number = 20,
  includeVariants = false
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
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (categoryId) params.append('categoryId', categoryId);
    if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
    if (hasVariants !== undefined) params.append('hasVariants', hasVariants.toString());
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (includeVariants) params.append('includeVariants', 'true');
    
    const response = await api.get(`/products/search?${params.toString()}`);
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

// Hàm mới để lấy sản phẩm bán chạy
export const getBestSellingProducts = async (
  limit: number = 10,
  includeVariants = false
): Promise<Product[]> => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (includeVariants) params.append('includeVariants', 'true');
    
    const response = await api.get(`/products/best-selling?${params.toString()}`);
    return response.data as Product[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

// Hàm mới để lấy sản phẩm xem nhiều
export const getMostViewedProducts = async (
  limit: number = 10,
  includeVariants = false
): Promise<Product[]> => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (includeVariants) params.append('includeVariants', 'true');
    
    const response = await api.get(`/products/most-viewed?${params.toString()}`);
    return response.data as Product[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const createProduct = async (product: {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  status?: "active" | "inactive" | "out_of_stock";
  image_url?: string;
  images?: string[];
  category_id: string;
  variants?: VariantCreate[];
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
    variants?: VariantCreate[];
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

export const restoreProduct = async (id: string) => {
  try {
    const response = await api.patch(`/products/${id}/restore`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getProductReviews = async (id: string) => {
  try {
    const response = await api.get(`/products/${id}/reviews`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getVariantsByProduct = async (productId: string): Promise<Variant[]> => {
  const res = await api.get(`/product-variants/${productId}`);
  return res.data as Variant[];
};

export type VariantCreate = Omit<Variant, '_id'>;

export const createVariant = async (variants: VariantCreate[]): Promise<Variant[]> => {
  const res = await api.post('/product-variants', variants);
  return res.data as Variant[];
};

export const deleteVariant = async (variantId: string): Promise<{ message: string }> => {
  const res = await api.delete(`/product-variants/${variantId}`);
  return res.data as { message: string };
};

// Hàm mới để cập nhật trạng thái variant
export const updateVariantStatus = async (
  variantId: string,
  isActive: boolean
): Promise<{ message: string }> => {
  const res = await api.patch(`/product-variants/${variantId}/status`, { is_active: isActive });
  return res.data as { message: string };
};

// Hàm mới để cập nhật thứ tự sắp xếp variant
export const updateVariantSortOrder = async (
  variantId: string,
  sortOrder: number
): Promise<{ message: string }> => {
  const res = await api.patch(`/product-variants/${variantId}/sort-order`, { sort_order: sortOrder });
  return res.data as { message: string };
};