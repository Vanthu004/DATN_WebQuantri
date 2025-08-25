import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/notify/notify.css";
import { useOrderNotify } from "../../contexts/OrderNotifyContext";
import api from "../../configs/api";

interface Order {
  _id: string;
  order_code: string;
  total_price: number;
  user_id?: { name?: string; email?: string };
  createdAt?: string;
  status?: string;
}

const Notify = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const navigate = useNavigate();
  const { newOrderCount, resetOrderChecking } = useOrderNotify();

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await api.get("/orders");
        const data = (response.data as any)?.data?.orders || (response.data as any)?.data || response.data; // Handle nested structure
        
        if (Array.isArray(data) && data.length > 0) {
          // Sắp xếp theo thời gian tạo mới nhất
          const sortedOrders = data.sort((a: Order, b: Order) => 
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
          );
          
          // Lấy 5 đơn hàng mới nhất
          const lastOrders = sortedOrders.slice(0, 5);
          setRecentOrders(lastOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchRecentOrders();
  }, []);

  const handleOrderClick = (id: string) => {
    navigate(`/orders/${id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleManualRefresh = () => {
    resetOrderChecking();
    window.location.reload();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Thông báo đơn hàng</h2>
        <p className="text-gray-600">Danh sách các đơn hàng mới nhất</p>
        {newOrderCount > 0 && (
          <div className="mt-2 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-800 font-medium">
              🔔 Có {newOrderCount} đơn hàng chờ xử lý
            </p>
          </div>
        )}
      </div>

      {/* Orders Table View */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-700">Bảng chi tiết đơn hàng</h4>
            <span className="text-sm text-gray-500">
              Cập nhật tự động mỗi 5 giây
            </span>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đơn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-blue-500' : 
                      index === 2 ? 'bg-yellow-500' : 
                      'bg-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.user_id?.name || "Ẩn danh"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {order.total_price?.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === "Chờ xử lý" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {order.status || "Chờ xử lý"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-md transition-colors"
                      onClick={() => handleOrderClick(order._id)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Không có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button 
          onClick={handleManualRefresh}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          🔄 Làm mới thủ công
        </button>
        
        <button 
          onClick={() => navigate('/orders')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          📋 Xem tất cả đơn hàng
        </button>

        <button 
          onClick={() => navigate('/send-notification')}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
        >
          📤 Gửi thông báo
        </button>
      </div>
    </div>
  );
};

export default Notify;
