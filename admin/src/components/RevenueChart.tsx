import React, { useState, useEffect } from "react";
import SalesStatisticsService, {
  RevenueStatistics,
} from "../services/salesStatistics";

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
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="mr-2">📈</span>
              Biểu đồ doanh thu
            </h3>
            <button
              onClick={fetchData}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              Thử lại
            </button>
          </div>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.order_count, 0);
  const totalProducts = data.reduce(
    (sum, item) => sum + item.product_sold_count,
    0
  );

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="mr-2">📈</span>
            Biểu đồ doanh thu
          </h3>
          <div className="flex items-center space-x-2">
            <select
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
            </select>
            <button
              onClick={exportData}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Xuất CSV"
            >
              📥
            </button>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">📅</span>
            <span className="text-sm text-gray-600">Từ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Đến:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-blue-900">
              {SalesStatisticsService.formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-green-900">
              {SalesStatisticsService.formatNumber(totalOrders)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">
              Sản phẩm bán ra
            </p>
            <p className="text-2xl font-bold text-purple-900">
              {SalesStatisticsService.formatNumber(totalProducts)}
            </p>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-500 mb-2">Biểu đồ doanh thu</p>
          <p className="text-sm text-gray-400">
            {data.length} điểm dữ liệu từ{" "}
            {SalesStatisticsService.formatDate(data[0]?._id || "")}
            đến{" "}
            {SalesStatisticsService.formatDate(
              data[data.length - 1]?._id || ""
            )}
          </p>

          {/* Simple Bar Chart */}
          {data.length > 0 && (
            <div className="mt-6">
              <div className="flex items-end justify-between h-32 space-x-1">
                {data.slice(-10).map((item, index) => {
                  const maxRevenue = Math.max(...data.map((d) => d.revenue));
                  const height =
                    maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${height}%` }}
                        title={`${SalesStatisticsService.formatDate(
                          item._id
                        )}: ${SalesStatisticsService.formatCurrency(
                          item.revenue
                        )}`}
                      />
                      <p className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                        {SalesStatisticsService.formatDate(item._id)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
