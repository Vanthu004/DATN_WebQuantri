import React, { useState } from 'react';
import { SalesDashboard } from '../../components/SalesDashboard';
import { RevenueChart } from '../../components/RevenueChart';

const SalesStatisticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
    { id: 'revenue', label: 'Doanh thu', icon: '💰' },
    { id: 'products', label: 'Sản phẩm', icon: '📦' },
    { id: 'trends', label: 'Xu hướng', icon: '📈' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SalesDashboard />;
      case 'revenue':
        return <RevenueChart />;
      case 'products':
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Thống kê sản phẩm bán chạy</h3>
            <p className="text-gray-600">Component sẽ được thêm sau</p>
          </div>
        );
      case 'trends':
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2">Xu hướng tăng trưởng</h3>
            <p className="text-gray-600">Component sẽ được thêm sau</p>
          </div>
        );
      default:
        return <SalesDashboard />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thống kê doanh thu</h1>
          <p className="text-gray-600">
            Theo dõi hiệu suất kinh doanh và phân tích xu hướng bán hàng
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {renderContent()}
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Hành động nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Xuất báo cáo PDF
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Gửi email báo cáo
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Lên lịch báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesStatisticsPage; 