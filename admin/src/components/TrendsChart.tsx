import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import SalesStatisticsService, {
  RevenueStatistics,
} from "../services/salesStatistics";
import { DateRangePicker } from "./DateRangePicker";
import { LoadingSkeleton } from "./common/LoadingSkeleton";
import { ErrorBoundary } from "./common/ErrorBoundary";
import { PeriodSelector } from "./common/PeriodSelector";

// Đăng ký các components cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendsChartProps {
  className?: string;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({ className }) => {
  const [currentData, setCurrentData] = useState<RevenueStatistics[]>([]);
  const [previousData, setPreviousData] = useState<RevenueStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let currentStartDate: Date;
      let previousStartDate: Date;

      if (startDate && endDate) {
        // Use custom date range
        currentStartDate = new Date(startDate);
        const currentEndDate = new Date(endDate);
        const periodDays = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (24 * 60 * 60 * 1000));
        
        previousStartDate = new Date(currentStartDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
      } else {
        // Use period-based calculation
        const now = new Date();
        switch (period) {
          case "7d":
            currentStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            previousStartDate = new Date(
              now.getTime() - 14 * 24 * 60 * 60 * 1000
            );
            break;
          case "30d":
            currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            previousStartDate = new Date(
              now.getTime() - 60 * 24 * 60 * 60 * 1000
            );
            break;
          case "90d":
            currentStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            previousStartDate = new Date(
              now.getTime() - 180 * 24 * 60 * 60 * 1000
            );
            break;
          default:
            currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            previousStartDate = new Date(
              now.getTime() - 60 * 24 * 60 * 60 * 1000
            );
        }
      }

      const currentEndDate = startDate && endDate ? new Date(endDate) : new Date(new Date().getTime() - 24 * 60 * 60 * 1000); // Hôm qua
      const previousEndDate = new Date(
        currentStartDate.getTime() - 24 * 60 * 60 * 1000
      );

      const [currentResponse, previousResponse] = await Promise.all([
        SalesStatisticsService.getRevenueStatistics({
          type: "daily",
          start_date: startDate || currentStartDate.toISOString().split("T")[0],
          end_date: endDate || currentEndDate.toISOString().split("T")[0],
        }),
        SalesStatisticsService.getRevenueStatistics({
          type: "daily",
          start_date: previousStartDate.toISOString().split("T")[0],
          end_date: previousEndDate.toISOString().split("T")[0],
        }),
      ]);

      setCurrentData(currentResponse.data);
      setPreviousData(previousResponse.data);
    } catch (err) {
      setError("Không thể tải dữ liệu xu hướng");
      console.error("Error fetching trends data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, startDate, endDate]);

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthColor = (growth: number): string => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getGrowthIcon = (growth: number): string => {
    if (growth > 0) return "📈";
    if (growth < 0) return "📉";
    return "➡️";
  };

  if (loading) {
    return <LoadingSkeleton type="chart" className={className} />;
  }

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        onRetry={fetchData}
        className={className}
        title="Lỗi tải dữ liệu xu hướng"
        retryText="Thử lại"
      />
    );
  }

  const currentTotalRevenue = currentData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const currentTotalOrders = currentData.reduce(
    (sum, item) => sum + item.order_count,
    0
  );
  const currentTotalProducts = currentData.reduce(
    (sum, item) => sum + item.product_sold_count,
    0
  );

  const previousTotalRevenue = previousData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const previousTotalOrders = previousData.reduce(
    (sum, item) => sum + item.order_count,
    0
  );
  const previousTotalProducts = previousData.reduce(
    (sum, item) => sum + item.product_sold_count,
    0
  );

  const revenueGrowth = calculateGrowth(
    currentTotalRevenue,
    previousTotalRevenue
  );
  const ordersGrowth = calculateGrowth(currentTotalOrders, previousTotalOrders);
  const productsGrowth = calculateGrowth(
    currentTotalProducts,
    previousTotalProducts
  );

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="mr-2">🌊</span>
            Xu hướng tăng trưởng dạng sóng
          </h3>
          <PeriodSelector
            value={period}
            onChange={setPeriod}
            label=""
          />
        </div>

        {/* Date Range Picker */}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          showQuickSelect={true}
          showValidation={true}
          className="mb-6"
        />

        {/* Growth Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Doanh thu</p>
              <span className="text-lg">
                {getGrowthIcon(revenueGrowth)}
              </span>
            </div>
            <p className="text-2xl font-bold">
              {SalesStatisticsService.formatCurrency(currentTotalRevenue)}
            </p>
            <p className="text-sm opacity-90">
              {revenueGrowth > 0 ? "+" : ""}
              {revenueGrowth.toFixed(1)}% so với kỳ trước
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Đơn hàng</p>
              <span className="text-lg">
                {getGrowthIcon(ordersGrowth)}
              </span>
            </div>
            <p className="text-2xl font-bold">
              {SalesStatisticsService.formatNumber(currentTotalOrders)}
            </p>
            <p className="text-sm opacity-90">
              {ordersGrowth > 0 ? "+" : ""}
              {ordersGrowth.toFixed(1)}% so với kỳ trước
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Sản phẩm bán</p>
              <span className="text-lg">
                {getGrowthIcon(productsGrowth)}
              </span>
            </div>
            <p className="text-2xl font-bold">
              {SalesStatisticsService.formatNumber(currentTotalProducts)}
            </p>
            <p className="text-sm opacity-90">
              {productsGrowth > 0 ? "+" : ""}
              {productsGrowth.toFixed(1)}% so với kỳ trước
            </p>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-medium mb-4">So sánh với kỳ trước</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-3">
                Kỳ hiện tại
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Doanh thu:</span>
                  <span className="font-medium">
                    {SalesStatisticsService.formatCurrency(currentTotalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Đơn hàng:</span>
                  <span className="font-medium">{currentTotalOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sản phẩm:</span>
                  <span className="font-medium">{currentTotalProducts}</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-3">
                Kỳ trước
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Doanh thu:</span>
                  <span className="font-medium">
                    {SalesStatisticsService.formatCurrency(
                      previousTotalRevenue
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Đơn hàng:</span>
                  <span className="font-medium">{previousTotalOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sản phẩm:</span>
                  <span className="font-medium">{previousTotalProducts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trends Wave Chart */}
        {currentData.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-4">Xu hướng tăng trưởng theo thời gian</h4>
            <div className="h-80">
              <Line 
                data={{
                  labels: currentData.map((item) => SalesStatisticsService.formatDate(item._id)),
                  datasets: [
                    {
                      label: "Kỳ hiện tại",
                      data: currentData.map((item) => item.revenue),
                      borderColor: "rgb(59, 130, 246)",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: "rgb(59, 130, 246)",
                      pointBorderColor: "#fff",
                      pointBorderWidth: 2,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    },
                    {
                      label: "Kỳ trước",
                      data: previousData.map((item) => item.revenue),
                      borderColor: "rgb(147, 51, 234)",
                      backgroundColor: "rgba(147, 51, 234, 0.1)",
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: "rgb(147, 51, 234)",
                      pointBorderColor: "#fff",
                      pointBorderWidth: 2,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: "index" as const,
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      position: "top" as const,
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 12,
                          weight: "bold",
                        },
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: true,
                      callbacks: {
                        label: function (context: any) {
                          return `${context.dataset.label}: ${SalesStatisticsService.formatCurrency(context.parsed.y)}`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      display: true,
                      title: {
                        display: true,
                        text: "Thời gian",
                        font: {
                          size: 12,
                          weight: "bold",
                        },
                      },
                      grid: {
                        display: true,
                        color: "rgba(0, 0, 0, 0.05)",
                      },
                    },
                    y: {
                      type: "linear" as const,
                      display: true,
                      position: "left" as const,
                      title: {
                        display: true,
                        text: "Doanh thu (VND)",
                        font: {
                          size: 12,
                          weight: "bold",
                        },
                      },
                      grid: {
                        display: true,
                        color: "rgba(0, 0, 0, 0.05)",
                      },
                      ticks: {
                        callback: function (value: any) {
                          return SalesStatisticsService.formatCurrency(value);
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Growth Analysis */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Phân tích tăng trưởng</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-lg p-4 text-white ${
              revenueGrowth > 0 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : revenueGrowth < 0
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-gradient-to-r from-gray-500 to-gray-600"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Doanh thu</span>
                <span className="text-lg">
                  {getGrowthIcon(revenueGrowth)}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {revenueGrowth > 0 ? "+" : ""}
                {revenueGrowth.toFixed(1)}%
              </p>
              <p className="text-xs opacity-90 mt-1">
                {revenueGrowth > 0
                  ? "Tăng trưởng tốt"
                  : revenueGrowth < 0
                  ? "Cần cải thiện"
                  : "Ổn định"}
              </p>
            </div>

            <div className={`rounded-lg p-4 text-white ${
              ordersGrowth > 0 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : ordersGrowth < 0
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-gradient-to-r from-gray-500 to-gray-600"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Đơn hàng</span>
                <span className="text-lg">
                  {getGrowthIcon(ordersGrowth)}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {ordersGrowth > 0 ? "+" : ""}
                {ordersGrowth.toFixed(1)}%
              </p>
              <p className="text-xs opacity-90 mt-1">
                {ordersGrowth > 0
                  ? "Khách hàng tăng"
                  : ordersGrowth < 0
                  ? "Cần marketing"
                  : "Ổn định"}
              </p>
            </div>

            <div className={`rounded-lg p-4 text-white ${
              productsGrowth > 0 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : productsGrowth < 0
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-gradient-to-r from-gray-500 to-gray-600"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Sản phẩm</span>
                <span className="text-lg">
                  {getGrowthIcon(productsGrowth)}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {productsGrowth > 0 ? "+" : ""}
                {productsGrowth.toFixed(1)}%
              </p>
              <p className="text-xs opacity-90 mt-1">
                {productsGrowth > 0
                  ? "Bán chạy"
                  : productsGrowth < 0
                  ? "Cần đẩy mạnh"
                  : "Ổn định"}
              </p>
            </div>
          </div>
        </div>

        {currentData.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-gray-500">Không có dữ liệu xu hướng</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendsChart;
