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

interface RevenueChartProps {
  className?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ className }) => {
  const [data, setData] = useState<RevenueStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"daily" | "weekly" | "monthly" | "yearly">(
    "daily"
  );
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: {
        type: "daily" | "weekly" | "monthly" | "yearly";
        start_date?: string;
        end_date?: string;
      } = { type };
      if (startDate) {
        params.start_date = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
      }

      const response = await SalesStatisticsService.getRevenueStatistics(
        params
      );
      setData(response.data);
    } catch (err) {
      setError("Không thể tải dữ liệu thống kê");
      console.error("Error fetching revenue data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, startDate, endDate]);

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const exportData = () => {
    const csvContent = [
      ["Ngày", "Doanh thu", "Số đơn hàng", "Số sản phẩm bán"],
      ...data.map((item) => [
        item._id,
        item.revenue.toString(),
        item.order_count.toString(),
        item.product_sold_count.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `thong-ke-doanh-thu-${type}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        title="Lỗi tải dữ liệu biểu đồ"
        retryText="Thử lại"
      />
    );
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.order_count, 0);
  const totalProducts = data.reduce(
    (sum, item) => sum + item.product_sold_count,
    0
  );

  // Tính toán xu hướng
  const calculateTrend = () => {
    if (data.length < 2) return { trend: "stable", percentage: 0 };

    const recentData = data.slice(-7); // 7 điểm dữ liệu gần nhất
    const olderData = data.slice(-14, -7); // 7 điểm dữ liệu trước đó

    if (olderData.length === 0) return { trend: "stable", percentage: 0 };

    const recentAvg =
      recentData.reduce((sum, item) => sum + item.revenue, 0) /
      recentData.length;
    const olderAvg =
      olderData.reduce((sum, item) => sum + item.revenue, 0) / olderData.length;

    const percentage = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (percentage > 5)
      return { trend: "up", percentage: Math.abs(percentage) };
    if (percentage < -5)
      return { trend: "down", percentage: Math.abs(percentage) };
    return { trend: "stable", percentage: Math.abs(percentage) };
  };

  const trendData = calculateTrend();

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="mr-2">🌊</span>
            Biểu đồ doanh thu dạng sóng
          </h3>
          <div className="flex items-center space-x-2">
            {/* <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as "daily" | "weekly" | "monthly" | "yearly"
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Theo ngày</option>
              <option value="weekly">Theo tuần</option>
              <option value="monthly">Theo tháng</option>
              <option value="yearly">Theo năm</option>
            </select> */}
            {/* <button
              onClick={exportData}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Xuất CSV"
            >
              📥
            </button> */}
          </div>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Tổng doanh thu</p>
            <p className="text-2xl font-bold">
              {SalesStatisticsService.formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Tổng đơn hàng</p>
            <p className="text-2xl font-bold">
              {SalesStatisticsService.formatNumber(totalOrders)}
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <p className="text-sm opacity-90">Sản phẩm bán ra</p>
            <p className="text-2xl font-bold">
              {SalesStatisticsService.formatNumber(totalProducts)}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg text-white ${
              trendData.trend === "up"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : trendData.trend === "down"
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-gradient-to-r from-gray-500 to-gray-600"
            }`}
          >
            <p className="text-sm opacity-90">Xu hướng</p>
            <div className="flex items-center">
              <span className="text-2xl font-bold mr-2">
                {trendData.trend === "up"
                  ? "↗"
                  : trendData.trend === "down"
                  ? "↘"
                  : "→"}
              </span>
              <span className="text-lg">
                {trendData.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Wave Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="h-80">
            {data.length > 0 ? (
              <Line
                data={{
                  labels: data.map((item) =>
                    SalesStatisticsService.formatDate(item._id)
                  ),
                  datasets: [
                    {
                      label: "Doanh thu",
                      data: data.map((item) => item.revenue),
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
                      label: "Số đơn hàng",
                      data: data.map((item) => item.order_count * 1000), // Scale để hiển thị cùng biểu đồ
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
                      yAxisID: "y1",
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
                          if (context.datasetIndex === 0) {
                            return `Doanh thu: ${SalesStatisticsService.formatCurrency(
                              context.parsed.y
                            )}`;
                          } else {
                            return `Số đơn hàng: ${context.parsed.y / 1000}`;
                          }
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
                    y1: {
                      type: "linear" as const,
                      display: true,
                      position: "right" as const,
                      title: {
                        display: true,
                        text: "Số đơn hàng",
                        font: {
                          size: 12,
                          weight: "bold",
                        },
                      },
                      grid: {
                        drawOnChartArea: false,
                      },
                      ticks: {
                        callback: function (value: any) {
                          return Math.round(value / 1000);
                        },
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trend Analysis */}
        {data.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              Phân tích xu hướng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-700 font-medium">Xu hướng hiện tại:</p>
                <p className="text-blue-900">
                  {trendData.trend === "up"
                    ? "Tăng trưởng tích cực"
                    : trendData.trend === "down"
                    ? "Có dấu hiệu giảm"
                    : "Ổn định"}
                </p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Tỷ lệ thay đổi:</p>
                <p className="text-blue-900">
                  {trendData.percentage.toFixed(1)}% so với giai đoạn trước
                </p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Điểm dữ liệu:</p>
                <p className="text-blue-900">
                  {data.length} điểm từ{" "}
                  {SalesStatisticsService.formatDate(data[0]?._id || "")}
                  đến{" "}
                  {SalesStatisticsService.formatDate(
                    data[data.length - 1]?._id || ""
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        {data.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Chi tiết dữ liệu</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Ngày</th>
                    <th className="text-right py-2">Doanh thu</th>
                    <th className="text-right py-2">Đơn hàng</th>
                    <th className="text-right py-2">Sản phẩm</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(-10).map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        {SalesStatisticsService.formatDate(item._id)}
                      </td>
                      <td className="text-right py-2 font-medium">
                        {SalesStatisticsService.formatCurrency(item.revenue)}
                      </td>
                      <td className="text-right py-2">{item.order_count}</td>
                      <td className="text-right py-2">
                        {item.product_sold_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
