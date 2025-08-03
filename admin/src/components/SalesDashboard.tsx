import React, { useState, useEffect } from 'react';
import SalesStatisticsService, {
  DashboardData
} from '../services/salesStatistics';

interface SalesDashboardProps {
  className?: string;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ className }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await SalesStatisticsService.getDashboardStatistics({ period });
      setDashboardData(response.data);
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Thống kê doanh thu</h2>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Thống kê doanh thu</h2>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Thử lại
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { revenue, top_products, category_stats, customer_stats } = dashboardData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Thống kê doanh thu</h2>
          <p className="text-gray-600">
            Dữ liệu thống kê {SalesStatisticsService.getPeriodLabel(period)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
            <option value="90d">90 ngày</option>
          </select>
          <button 
            onClick={fetchDashboardData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Tổng doanh thu</h3>
            <span className="text-gray-400">💰</span>
          </div>
          <div className="text-2xl font-bold">
            {SalesStatisticsService.formatCurrency(revenue.total_revenue)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {revenue.order_count} đơn hàng
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Số đơn hàng</h3>
            <span className="text-gray-400">🛒</span>
          </div>
          <div className="text-2xl font-bold">
            {SalesStatisticsService.formatNumber(revenue.order_count)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Trung bình {SalesStatisticsService.formatCurrency(revenue.avg_order_value)}/đơn
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Khách hàng</h3>
            <span className="text-gray-400">👥</span>
          </div>
          <div className="text-2xl font-bold">
            {SalesStatisticsService.formatNumber(customer_stats.total_customers)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Trung bình {SalesStatisticsService.formatCurrency(customer_stats.average_order_value)}/khách
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Sản phẩm bán chạy</h3>
            <span className="text-gray-400">📈</span>
          </div>
          <div className="text-2xl font-bold">
            {top_products.length}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Top sản phẩm
          </p>
        </div>
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
              <div key={product._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{product.product_name}</p>
                    <p className="text-xs text-gray-500">
                      {SalesStatisticsService.formatNumber(product.quantity_sold)} sản phẩm
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
              <div key={category._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{category.category_name}</p>
                  <p className="text-xs text-gray-500">
                    {SalesStatisticsService.formatNumber(category.quantity_sold)} sản phẩm
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