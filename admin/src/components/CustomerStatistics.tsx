import React, { useState, useEffect } from "react";
import "../css/statistics/customerStatistics.css";
import {
  fetchCustomerStatistics,
  fetchTopCustomers,
  CustomerStats as CustomerStatsType,
  TopCustomerItem,
} from "../services/customerStatistics";

export const CustomerStatistics: React.FC = () => {
  const [stats, setStats] = useState<CustomerStatsType>({
    totalCustomers: 0,
    customersWithOrders: 0,
    newCustomersThisMonth: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    customerRetentionRate: 0,
  });
  const [topCustomers, setTopCustomers] = useState<TopCustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    fetchCustomerStats();
  }, [timeRange]);

  const fetchCustomerStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token đăng nhập");

      const [statsData, topCustomersData] = await Promise.all([
        fetchCustomerStatistics(timeRange as any, token),
        fetchTopCustomers(token),
      ]);

      setStats(statsData);
      setTopCustomers(topCustomersData);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê khách hàng:", error);
      // Reset data khi có lỗi
      setStats({
        totalCustomers: 0,
        customersWithOrders: 0,
        newCustomersThisMonth: 0,
        activeCustomers: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        customerRetentionRate: 0,
      });
      setTopCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Thời gian:
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng khách hàng</p>
              <p className="text-2xl font-bold">
                {stats.totalCustomers.toLocaleString()}
              </p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Khách có đơn hàng</p>
              <p className="text-2xl font-bold">
                {stats.customersWithOrders.toLocaleString()}
              </p>
            </div>
            <span className="text-3xl">🛒</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Khách mới tháng này</p>
              <p className="text-2xl font-bold">
                {stats.newCustomersThisMonth.toLocaleString()}
              </p>
            </div>
            <span className="text-3xl">🆕</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Khách hàng tích cực</p>
              <p className="text-2xl font-bold">
                {stats.activeCustomers.toLocaleString()}
              </p>
            </div>
            <span className="text-3xl">⭐</span>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">💰</span>
            Doanh thu
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng doanh thu:</span>
              <span className="font-semibold">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giá trị đơn hàng TB:</span>
              <span className="font-semibold">
                {formatCurrency(stats.averageOrderValue)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Tỷ lệ giữ chân
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.customerRetentionRate}%
            </div>
            <p className="text-gray-600 text-sm">
              Khách hàng quay lại mua hàng
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Tỷ lệ chuyển đổi
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {(
                (stats.customersWithOrders / stats.totalCustomers) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-gray-600 text-sm">
              Khách hàng từ đăng ký thành mua hàng
            </p>
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="mr-2">🏆</span>
            Top Khách Hàng Tiềm Năng
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng chi tiêu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.role === "customer"
                            ? "Khách hàng"
                            : customer.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {customer.orderCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(customer.totalSpent || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Phân tích khách hàng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">📊 Tổng quan</h4>
            <p className="text-gray-600">
              Hệ thống hiện có {stats.totalCustomers.toLocaleString()} khách
              hàng đăng ký, trong đó{" "}
              {stats.customersWithOrders.toLocaleString()} khách hàng đã có đơn
              hàng.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">🆕 Khách hàng mới</h4>
            <p className="text-gray-600">
              Tháng này có {stats.newCustomersThisMonth.toLocaleString()} khách
              hàng mới đăng ký, tỷ lệ tăng trưởng{" "}
              {(
                (stats.newCustomersThisMonth / stats.totalCustomers) *
                100
              ).toFixed(1)}
              %.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">💰 Doanh thu</h4>
            <p className="text-gray-600">
              Tổng doanh thu từ khách hàng: {formatCurrency(stats.totalRevenue)}
              , giá trị đơn hàng trung bình:{" "}
              {formatCurrency(stats.averageOrderValue)}.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">⭐ Chất lượng</h4>
            <p className="text-gray-600">
              Tỷ lệ giữ chân khách hàng: {stats.customerRetentionRate}%,
              {stats.activeCustomers.toLocaleString()} khách hàng tích cực trong
              hệ thống.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerStatistics;
