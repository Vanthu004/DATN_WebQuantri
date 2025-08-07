import api from "../configs/api";

// Interfaces cho thống kê doanh thu
export interface RevenueStatistics {
  _id: string;
  revenue: number;
  order_count: number;
  product_sold_count: number;
}

export interface RevenueStatisticsResponse {
  success: boolean;
  data: RevenueStatistics[];
  type: string;
  total_revenue: number;
  total_orders: number;
}

// Interfaces cho sản phẩm bán chạy
export interface TopSellingProduct {
  _id: string;
  product_name: string;
  product_image?: string;
  category_name?: string;
  quantity_sold: number;
  revenue: number;
  order_count: number;
}

export interface TopSellingProductsResponse {
  success: boolean;
  data: TopSellingProduct[];
  period: string;
  total_products: number;
}

// Interfaces cho dashboard
export interface DashboardRevenue {
  total_revenue: number;
  order_count: number;
  avg_order_value: number;
}

export interface CategoryStats {
  _id: string;
  category_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface OrderStatusStats {
  _id: string;
  order_count: number;
  revenue: number;
}

export interface CustomerStats {
  total_customers: number;
  average_order_value: number;
}

export interface DashboardData {
  period: string;
  revenue: DashboardRevenue;
  top_products: TopSellingProduct[];
  category_stats: CategoryStats[];
  order_status_stats: OrderStatusStats[];
  customer_stats: CustomerStats;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

// Interfaces cho thống kê theo khoảng thời gian
export interface DateRangeStatistics {
  _id: string;
  revenue: number;
  order_count: number;
  product_sold_count: number;
}

export interface DateRangeResponse {
  success: boolean;
  data: DateRangeStatistics[];
  source: "cached" | "real-time";
}

// Interface cho response generate daily statistics
export interface GenerateDailyStatisticsResponse {
  success: boolean;
  msg: string;
  data?: unknown;
}

// Service class
export class SalesStatisticsService {
  // Thống kê doanh thu theo thời gian
  static async getRevenueStatistics(params: {
    type?: "daily" | "weekly" | "monthly" | "yearly";
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<RevenueStatisticsResponse> {
    const queryParams = new URLSearchParams();

    if (params.type) queryParams.append("type", params.type);
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const response = await api.get(`/sales-statistics/revenue?${queryParams}`);
    return response.data as RevenueStatisticsResponse;
  }

  // Thống kê sản phẩm bán chạy
  static async getTopSellingProducts(params: {
    period?: "7d" | "30d" | "90d" | "all";
    start_date?: string;
    end_date?: string;
    limit?: number;
    category_id?: string;
  }): Promise<TopSellingProductsResponse> {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append("period", params.period);
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.category_id)
      queryParams.append("category_id", params.category_id);

    const response = await api.get(
      `/sales-statistics/top-products?${queryParams}`
    );
    return response.data as TopSellingProductsResponse;
  }

  // Thống kê tổng quan dashboard
  static async getDashboardStatistics(params: {
    period?: "7d" | "30d" | "90d";
    start_date?: string;
    end_date?: string;
  }): Promise<DashboardResponse> {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append("period", params.period);
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);

    const response = await api.get(
      `/sales-statistics/dashboard?${queryParams}`
    );
    return response.data as DashboardResponse;
  }

  // Lấy thống kê theo khoảng thời gian
  static async getStatisticsByDateRange(params: {
    start_date: string;
    end_date: string;
    type?: "daily" | "weekly" | "monthly" | "yearly";
  }): Promise<DateRangeResponse> {
    const queryParams = new URLSearchParams();

    queryParams.append("start_date", params.start_date);
    queryParams.append("end_date", params.end_date);
    if (params.type) queryParams.append("type", params.type);

    const response = await api.get(
      `/sales-statistics/date-range?${queryParams}`
    );
    return response.data as DateRangeResponse;
  }

  // Tạo thống kê theo ngày (cron job)
  static async generateDailyStatistics(): Promise<GenerateDailyStatisticsResponse> {
    const response = await api.post("/sales-statistics/generate-daily");
    return response.data as GenerateDailyStatisticsResponse;
  }

  // Helper methods
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  static formatNumber(num: number): string {
    return new Intl.NumberFormat("vi-VN").format(num);
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("vi-VN");
  }

  static getPeriodLabel(period: string): string {
    switch (period) {
      case "7d":
        return "7 ngày qua";
      case "30d":
        return "30 ngày qua";
      case "90d":
        return "90 ngày qua";
      case "all":
        return "Tất cả";
      default:
        return period;
    }
  }

  static getTypeLabel(type: string): string {
    switch (type) {
      case "daily":
        return "Theo ngày";
      case "weekly":
        return "Theo tuần";
      case "monthly":
        return "Theo tháng";
      case "yearly":
        return "Theo năm";
      default:
        return type;
    }
  }
}

// Export default instance
export default SalesStatisticsService;
