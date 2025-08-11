import React, { useState, useEffect } from "react";
import api from "../configs/api";

interface TestData {
  totalOrders: number;
  ordersByStatus: Array<{ _id: string; count: number }>;
  ordersByPayment: Array<{ _id: string; count: number }>;
  recentOrders: Array<{
    status: string;
    payment_status: string;
    total_price: number;
    createdAt: string;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const TestDataComponent: React.FC = () => {
  const [data, setData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<ApiResponse<TestData>>("/sales-statistics/test");
      console.log("Test API response:", response.data);
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError("API trả về lỗi");
      }
    } catch (err: unknown) {
      console.error("Error fetching test data:", err);
      const errorMessage = err instanceof Error ? err.message : "Lỗi khi gọi API";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestData();
  }, []);

  if (loading) {
    return <div className="p-4">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Lỗi: {error}</p>
        <button 
          onClick={fetchTestData}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="p-4">Không có dữ liệu</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Test Data từ API</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Tổng đơn hàng</p>
          <p className="text-2xl font-bold text-blue-900">{data.totalOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-2">Đơn hàng theo status</h4>
          <div className="bg-gray-50 p-3 rounded">
            {data.ordersByStatus.map((item, index) => (
              <div key={index} className="flex justify-between py-1">
                <span className="font-medium">{item._id || "Không có"}:</span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Đơn hàng theo payment_status</h4>
          <div className="bg-gray-50 p-3 rounded">
            {data.ordersByPayment.map((item, index) => (
              <div key={index} className="flex justify-between py-1">
                <span className="font-medium">{item._id || "Không có"}:</span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-medium mb-2">5 đơn hàng gần nhất</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Payment</th>
                <th className="text-right py-2">Total Price</th>
                <th className="text-left py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2">{order.status}</td>
                  <td className="py-2">{order.payment_status}</td>
                  <td className="text-right py-2">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.total_price)}
                  </td>
                  <td className="py-2">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button 
        onClick={fetchTestData}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Refresh Data
      </button>
    </div>
  );
};

export default TestDataComponent; 