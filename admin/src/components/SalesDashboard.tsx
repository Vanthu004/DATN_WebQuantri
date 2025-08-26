import React, { useState, useEffect } from "react";
import SalesStatisticsService, {
  DashboardData,
} from "../services/salesStatistics";
import { DateRangePicker } from "./DateRangePicker";
import { LoadingSkeleton } from "./common/LoadingSkeleton";
import { ErrorBoundary } from "./common/ErrorBoundary";
import { PeriodSelector } from "./common/PeriodSelector";
import { SummaryCard } from "./common/SummaryCard";

interface SalesDashboardProps {
  className?: string;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({
  className,
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await SalesStatisticsService.getDashboardStatistics({
        period,
        start_date: startDate,
        end_date: endDate,
      });
      setDashboardData(response.data);
    } catch (err) {
      setError("Không thể tải dữ liệu thống kê");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period, startDate, endDate]);

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  if (loading) {
    return <LoadingSkeleton type="dashboard" className={className} />;
  }

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        onRetry={fetchDashboardData}
        className={className}
        title="Lỗi tải dữ liệu thống kê"
        retryText="Thử lại"
      />
    );
  }

  if (!dashboardData) return null;

  const { revenue, top_products, category_stats, customer_stats } =
    dashboardData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Thống kê doanh thu
          </h2>
          <p className="text-gray-600">
            Dữ liệu thống kê {SalesStatisticsService.getPeriodLabel(period)}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* <PeriodSelector
            value={period}
            onChange={setPeriod}
            label=""
          /> */}
          <button
            onClick={fetchDashboardData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Làm mới dữ liệu"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        showQuickSelect={true}
        showValidation={true}
      />

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Tổng doanh thu"
          value={SalesStatisticsService.formatCurrency(revenue.total_revenue)}
          subtitle={`${revenue.order_count} đơn hàng`}
          icon="💰"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />

        <SummaryCard
          title="Số đơn hàng"
          value={SalesStatisticsService.formatNumber(revenue.order_count)}
          subtitle={`Trung bình ${SalesStatisticsService.formatCurrency(
            revenue.avg_order_value
          )}/đơn`}
          icon="🛒"
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />

        <SummaryCard
          title="Khách hàng"
          value={SalesStatisticsService.formatNumber(
            customer_stats.total_customers
          )}
          subtitle={`Trung bình ${SalesStatisticsService.formatCurrency(
            customer_stats.average_order_value
          )}/khách`}
          icon="👥"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />

        <SummaryCard
          title="Sản phẩm bán chạy"
          value={top_products.length}
          subtitle="Top sản phẩm"
          icon="📈"
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Top Products and Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📦</span>
            Sản phẩm bán chạy
          </h3>
          <div className="space-y-4">
            {top_products.slice(0, 5).map((product, index) => (
              <div
                key={product._id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">
                      {product.product_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {SalesStatisticsService.formatNumber(
                        product.quantity_sold
                      )}{" "}
                      sản phẩm
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {SalesStatisticsService.formatCurrency(product.revenue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.order_count} đơn hàng
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Thống kê theo danh mục
          </h3>
          <div className="space-y-4">
            {category_stats.slice(0, 5).map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">
                    {category.category_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {SalesStatisticsService.formatNumber(
                      category.quantity_sold
                    )}{" "}
                    sản phẩm
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {SalesStatisticsService.formatCurrency(category.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
