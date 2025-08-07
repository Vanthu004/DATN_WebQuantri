import React, { useState, useEffect } from 'react';
import { getInventoryStats, type InventoryStats } from '../services/inventory';

const InventoryStatsComponent: React.FC = () => {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInventoryStats();
  }, []);

  const fetchInventoryStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInventoryStats();
      setStats(response.stats);
    } catch (err) {
      setError('Không thể tải thống kê kho hàng');
      console.error('Error fetching inventory stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải thống kê...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-500 text-xl mr-2">❌</div>
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={fetchInventoryStats}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
        >
          🔄 Thử lại
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.totalProducts)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số lượng</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.totalQuantity)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sắp hết hàng</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.lowStockProducts)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">🚫</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hết hàng</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.outOfStockProducts)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Giá trị tổng kho */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">Tổng giá trị kho hàng</p>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div className="text-4xl opacity-80">💰</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sản phẩm sắp hết hàng */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-yellow-600 mr-2">⚠️</span>
              Sản phẩm sắp hết hàng
            </h3>
          </div>
          <div className="p-6">
            {stats.lowStockProductsList.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStockProductsList.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        Còn lại: <span className="font-semibold text-red-600">{product.stock_quantity}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Không có sản phẩm nào sắp hết hàng</p>
            )}
          </div>
        </div>

        {/* Sản phẩm hết hàng */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-red-600 mr-2">🚫</span>
              Sản phẩm hết hàng
            </h3>
          </div>
          <div className="p-6">
            {stats.outOfStockProductsList.length > 0 ? (
              <div className="space-y-3">
                {stats.outOfStockProductsList.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-red-600 font-semibold">Hết hàng</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Không có sản phẩm nào hết hàng</p>
            )}
          </div>
        </div>
      </div>

             {/* Thống kê theo danh mục */}
       <div className="bg-white rounded-lg shadow">
         <div className="px-6 py-4 border-b border-gray-200">
           <h3 className="text-lg font-semibold text-gray-900 flex items-center">
             <span className="text-blue-600 mr-2">📊</span>
             Thống kê theo danh mục
           </h3>
         </div>
         <div className="p-6">
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Danh mục
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Số sản phẩm
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Tổng số lượng
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Giá trị
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {stats.categoryStats.map((category) => (
                   <tr key={category._id} className="hover:bg-gray-50">
                     <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                       {category._id || 'Không phân loại'}
                     </td>
                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                       {formatNumber(category.count)}
                     </td>
                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                       {formatNumber(category.totalQuantity)}
                     </td>
                     <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                       {formatCurrency(category.totalValue)}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       </div>

       {/* Bảng chi tiết tất cả sản phẩm */}
       <div className="bg-white rounded-lg shadow">
         <div className="px-6 py-4 border-b border-gray-200">
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div>
               <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                 <span className="text-green-600 mr-2">📋</span>
                 Chi tiết tất cả sản phẩm trong kho
               </h3>
               <p className="text-sm text-gray-600 mt-1">
                 Danh sách chi tiết số lượng còn lại của từng sản phẩm
               </p>
             </div>
             
             {/* Bộ lọc và tìm kiếm */}
             <div className="flex flex-col sm:flex-row gap-3">
               <input
                 type="text"
                 placeholder="Tìm kiếm sản phẩm..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
               />
               <select
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
               >
                 <option value="all">Tất cả trạng thái</option>
                 <option value="inStock">Còn hàng</option>
                 <option value="lowStock">Sắp hết</option>
                 <option value="outOfStock">Hết hàng</option>
               </select>
             </div>
           </div>
         </div>
         <div className="p-6">
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     #
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Tên sản phẩm
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Danh mục
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Số lượng
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Đơn giá
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Giá trị
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Trạng thái
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {stats.allProductsList
                   .filter((product) => {
                     // Lọc theo tìm kiếm
                     const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          (product.category_id && product.category_id.toLowerCase().includes(searchTerm.toLowerCase()));
                     
                     // Lọc theo trạng thái
                     const matchesStatus = statusFilter === 'all' ||
                                          (statusFilter === 'inStock' && product.stock_quantity > 10) ||
                                          (statusFilter === 'lowStock' && product.stock_quantity > 0 && product.stock_quantity <= 10) ||
                                          (statusFilter === 'outOfStock' && product.stock_quantity === 0);
                     
                     return matchesSearch && matchesStatus;
                   })
                   .map((product, index) => {
                   const getStatusColor = (quantity: number) => {
                     if (quantity === 0) return 'bg-red-100 text-red-800';
                     if (quantity <= 10) return 'bg-yellow-100 text-yellow-800';
                     return 'bg-green-100 text-green-800';
                   };
                   
                   const getStatusText = (quantity: number) => {
                     if (quantity === 0) return '🚫 Hết hàng';
                     if (quantity <= 10) return '⚠️ Sắp hết';
                     return '✅ Còn hàng';
                   };

                   return (
                     <tr key={product._id} className="hover:bg-gray-50">
                       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                         {index + 1}
                       </td>
                       <td className="px-4 py-4">
                         <div className="text-sm font-medium text-gray-900 max-w-xs">
                           {product.name.length > 30 ? (
                             <div className="group relative">
                               <span className="truncate block">
                                 {product.name.substring(0, 30)}...
                               </span>
                               <button 
                                 className="text-blue-600 hover:text-blue-800 text-xs ml-1 focus:outline-none"
                                 onClick={() => {
                                   const fullName = product.name;
                                   if (window.confirm(`Tên đầy đủ: ${fullName}\n\nBạn có muốn sao chép tên sản phẩm này không?`)) {
                                     navigator.clipboard.writeText(fullName);
                                   }
                                 }}
                                 title="Xem thêm"
                               >
                                 xem thêm
                               </button>
                             </div>
                           ) : (
                             <span>{product.name}</span>
                           )}
                         </div>
                       </td>
                       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                         {product.category_id || 'Không phân loại'}
                       </td>
                       <td className="px-4 py-4 whitespace-nowrap">
                         <span className={`text-sm font-semibold ${
                           product.stock_quantity === 0 ? 'text-red-600' : 
                           product.stock_quantity <= 10 ? 'text-yellow-600' : 'text-green-600'
                         }`}>
                           {formatNumber(product.stock_quantity)}
                         </span>
                       </td>
                       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                         {formatCurrency(product.price)}
                       </td>
                       <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                         {formatCurrency(product.stock_quantity * product.price)}
                       </td>
                       <td className="px-4 py-4 whitespace-nowrap">
                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.stock_quantity)}`}>
                           {getStatusText(product.stock_quantity)}
                         </span>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
           
           {/* Tổng kết bảng */}
           <div className="mt-6 pt-4 border-t border-gray-200">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="text-center">
                 <p className="text-sm text-gray-600">Tổng sản phẩm</p>
                 <p className="text-lg font-semibold text-gray-900">{formatNumber(stats.allProductsList.length)}</p>
               </div>
               <div className="text-center">
                 <p className="text-sm text-gray-600">Tổng số lượng</p>
                 <p className="text-lg font-semibold text-gray-900">{formatNumber(stats.totalQuantity)}</p>
               </div>
               <div className="text-center">
                 <p className="text-sm text-gray-600">Tổng giá trị</p>
                 <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalValue)}</p>
               </div>
               <div className="text-center">
                 <p className="text-sm text-gray-600">Trung bình/sản phẩm</p>
                 <p className="text-lg font-semibold text-gray-900">
                   {stats.allProductsList.length > 0 
                     ? formatCurrency(Math.round(stats.totalValue / stats.allProductsList.length))
                     : '0 ₫'
                   }
                 </p>
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>
  );
};

export default InventoryStatsComponent; 