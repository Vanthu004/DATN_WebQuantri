import React from "react";
import { StatisticsOverview } from "../../components/StatisticsOverview";

const SalesStatisticsPage: React.FC = () => {
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

      {/* Statistics Overview */}
      <StatisticsOverview />

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
