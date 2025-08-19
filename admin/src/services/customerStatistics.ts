import api from "../configs/api";

export interface CustomerStats {
  totalCustomers: number;
  customersWithOrders: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  customerRetentionRate: number;
}

export interface TopCustomerItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const fetchCustomerStatistics = async (
  timeRange: "week" | "month" | "quarter" | "year",
  token?: string
): Promise<CustomerStats> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await api.get<ApiResponse<CustomerStats>>(
    `/users/statistics?timeRange=${timeRange}`,
    { headers }
  );
  return res.data.data;
};

export const fetchTopCustomers = async (
  token?: string
): Promise<TopCustomerItem[]> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await api.get<ApiResponse<TopCustomerItem[]>>(
    "/users/top-customers",
    { headers }
  );
  return res.data.data;
};