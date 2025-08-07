import React, { useState, useEffect } from "react";
import SalesStatisticsService, {
  TopSellingProduct,
} from "../services/salesStatistics";
import { DateRangePicker } from "./DateRangePicker";

interface TopProductsChartProps {
  className?: string;
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({
  className,
}) => {
  const [data, setData] = useState<TopSellingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [limit, setLimit] = useState<number>(10);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await SalesStatisticsService.getTopSellingProducts({
        period,
        limit,
        start_date: startDate,
        end_date: endDate,
      });
      setData(response.data);
    } catch (err) {
      setError("Không thể tải dữ liệu sản phẩm bán chạy");
      console.error("Error fetching top products data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, limit, startDate, endDate]);

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const exportData = () => {
    const csvContent = [
      ["Tên sản phẩm", "Danh mục", "Số lượng bán", "Doanh thu", "Số đơn hàng"],
      ...data.map((item) => [
        item.product_name,
        item.category_name || "N/A",
        item.quantity_sold.toString(),
        item.revenue.toString(),
        item.order_count.toString(),
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
      `san-pham-ban-chay-${period}-${
        new Date().toISOString().split("T")[0]
      }.csv`
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
              <span className="mr-2">📦</span>
              Sản phẩm bán chạy
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
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity_sold, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.order_count, 0);

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="mr-2">📦</span>
            Sản phẩm bán chạy
          </h3>
          <div className="flex items-center space-x-2">
            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value as "7d" | "30d" | "90d" | "all")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">7 ngày</option>
              <option value="30d">30 ngày</option>
              <option value="90d">90 ngày</option>
              <option value="all">Tất cả</option>
            </select>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
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
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          className="mb-6"
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-blue-900">
              {SalesStatisticsService.formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Tổng số lượng</p>
            <p className="text-2xl font-bold text-green-900">
              {SalesStatisticsService.formatNumber(totalQuantity)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-purple-900">
              {SalesStatisticsService.formatNumber(totalOrders)}
            </p>
          </div>
        </div>

        {/* Chart and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium mb-4">Biểu đồ số lượng bán</h4>
            {data.length > 0 && (
              <div className="space-y-3">
                {data.slice(0, 8).map((item, index) => {
                  const maxQuantity = Math.max(
                    ...data.map((d) => d.quantity_sold)
                  );
                  const percentage =
                    maxQuantity > 0
                      ? (item.quantity_sold / maxQuantity) * 100
                      : 0;

                  return (
                    <div key={item._id} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium truncate max-w-32">
                            {item.product_name}
                          </span>
                          <span className="text-gray-600">
                            {item.quantity_sold}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Revenue Chart */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium mb-4">Biểu đồ doanh thu</h4>
            {data.length > 0 && (
              <div className="space-y-3">
                {data.slice(0, 8).map((item, index) => {
                  const maxRevenue = Math.max(...data.map((d) => d.revenue));
                  const percentage =
                    maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                  return (
                    <div key={item._id} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium truncate max-w-32">
                            {item.product_name}
                          </span>
                          <span className="text-gray-600">
                            {SalesStatisticsService.formatCurrency(
                              item.revenue
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        {data.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Chi tiết sản phẩm bán chạy</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4">#</th>
                    <th className="text-left py-3 px-4">Tên sản phẩm</th>
                    <th className="text-left py-3 px-4">Danh mục</th>
                    <th className="text-right py-3 px-4">Số lượng</th>
                    <th className="text-right py-3 px-4">Doanh thu</th>
                    <th className="text-right py-3 px-4">Đơn hàng</th>
                    <th className="text-right py-3 px-4">TB/đơn</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {item.product_name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {item.category_name || "N/A"}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {SalesStatisticsService.formatNumber(
                          item.quantity_sold
                        )}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {SalesStatisticsService.formatCurrency(item.revenue)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {item.order_count}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-600">
                        {SalesStatisticsService.formatCurrency(
                          item.revenue / item.order_count
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-500">Không có dữ liệu sản phẩm bán chạy</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProductsChart;
