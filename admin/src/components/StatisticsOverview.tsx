import React, { useState, useEffect } from "react";
import { SalesDashboard } from "./SalesDashboard";
import { RevenueChart } from "./RevenueChart";
import { TopProductsChart } from "./TopProductsChart";
import { TrendsChart } from "./TrendsChart";

interface StatisticsOverviewProps {
  className?: string;
}

export const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({
  className,
}) => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const sections = [
    { id: "dashboard", label: "Tổng quan", icon: "📊" },
    { id: "revenue", label: "Doanh thu", icon: "💰" },
    { id: "products", label: "Sản phẩm", icon: "📦" },
    { id: "trends", label: "Xu hướng", icon: "📈" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <SalesDashboard />;
      case "revenue":
        return <RevenueChart />;
      case "products":
        return <TopProductsChart />;
      case "trends":
        return <TrendsChart />;
      default:
        return <SalesDashboard />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeSection === section.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div>{renderSection()}</div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng quan</p>
              <p className="text-2xl font-bold">Dashboard</p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Phân tích</p>
              <p className="text-2xl font-bold">Doanh thu</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Sản phẩm</p>
              <p className="text-2xl font-bold">Bán chạy</p>
            </div>
            <span className="text-3xl">📦</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Xu hướng</p>
              <p className="text-2xl font-bold">Tăng trưởng</p>
            </div>
            <span className="text-3xl">📈</span>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg p-6">
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
              Xem top sản phẩm bán chạy với thống kê số lượng và doanh thu
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">📈 Xu hướng</h4>
            <p className="text-gray-600">
              So sánh tăng trưởng với kỳ trước và phân tích xu hướng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsOverview;
