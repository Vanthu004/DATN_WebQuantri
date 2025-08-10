import React from 'react';
import InventoryStats from '../../components/InventoryStats';

const InventoryPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📦 Thống kê kho hàng
        </h1>
        <p className="text-gray-600">
          Theo dõi tình trạng kho hàng, số lượng sản phẩm và giá trị tồn kho
        </p>
      </div>

      {/* Component thống kê */}
      <InventoryStats />
    </div>
  );
};

export default InventoryPage; 