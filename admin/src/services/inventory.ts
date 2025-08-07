import api from "../configs/api";

export interface InventoryStats {
  totalProducts: number;
  totalQuantity: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  lowStockProductsList: Array<{
    _id: string;
    name: string;
    stock_quantity: number;
    price: number;
    category_id?: string;
  }>;
  outOfStockProductsList: Array<{
    _id: string;
    name: string;
    price: number;
    category_id?: string;
  }>;
  allProductsList: Array<{
    _id: string;
    name: string;
    stock_quantity: number;
    price: number;
    category_id?: string;
  }>;
  categoryStats: Array<{
    _id: string;
    count: number;
    totalQuantity: number;
    totalValue: number;
  }>;
}

export interface InventoryStatsResponse {
  message: string;
  stats: InventoryStats;
}

// Lấy thống kê kho hàng
export const getInventoryStats = async (): Promise<InventoryStatsResponse> => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  const response = await api.get("/products/inventory/stats", { headers });
  return response.data as InventoryStatsResponse;
}; 