import React, { useState } from "react";
import { WaveChart } from "../../components/WaveChart";
import { CustomerStatistics } from "../../components/CustomerStatistics";
import { TopProductsChart } from "../../components/TopProductsChart";
import { TrendsChart } from "../../components/TrendsChart";
import { RevenueChart } from "../../components/RevenueChart";

const SalesStatisticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: "📊" },
    { id: "revenue", label: "Doanh thu", icon: "💰" },
    { id: "products", label: "Sản phẩm", icon: "📦" },
    { id: "trends", label: "Xu hướng", icon: "📈" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <WaveChart />
            <CustomerStatistics />
          </div>
        );
      case "revenue":
        return <RevenueChart className="mt-4" />;
      case "products":
        return <TopProductsChart className="mt-4" />;
      case "trends":
        return <TrendsChart className="mt-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thống kê bán hàng</h1>
        <p className="text-gray-600 mt-1">
          Phân tích chi tiết về doanh thu, sản phẩm và xu hướng bán hàng
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 rounded-lg p-6">{renderContent()}</div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Hướng dẫn sử dụng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">📊 Tổng quan</h4>
            <p className="text-gray-600">
              Xem thống kê tổng hợp về doanh thu, đơn hàng, khách hàng và sản
              phẩm bán chạy
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">💰 Doanh thu</h4>
            <p className="text-gray-600">
              Phân tích doanh thu theo thời gian với biểu đồ và bảng dữ liệu chi
              tiết
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">📦 Sản phẩm</h4>
            <p className="text-gray-600">
              Xem danh sách sản phẩm bán chạy và phân tích hiệu suất bán hàng
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">📈 Xu hướng</h4>
            <p className="text-gray-600">
              Phân tích xu hướng tăng trưởng và so sánh với các giai đoạn trước
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesStatisticsPage;
