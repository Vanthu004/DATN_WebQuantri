import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/notify/notify.css";
import { useOrderNotify } from "../../contexts/OrderNotifyContext";

interface Order {
  _id: string;
  order_code: string;
  total_price: number;
  user_id?: { name?: string; email?: string };
  createdAt?: string;
  status?: string;
  // ... các trường khác nếu cần
}

const Notify = () => {
  const [show, setShow] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lastCheckedOrderId, setLastCheckedOrderId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();
  const { setNewOrderCount } = useOrderNotify();

  useEffect(() => {
    const fetchLatestOrders = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/orders");
        if (!res.ok) {
          console.error('Failed to fetch orders:', res.status);
          return;
        }
        
        const data = await res.json();
        console.log('Fetched orders:', data); // Debug log
        
        if (Array.isArray(data) && data.length > 0) {
          // Sắp xếp theo thời gian tạo mới nhất
          const sortedOrders = data.sort((a: Order, b: Order) => 
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
          );
          
          // Lấy 5 đơn hàng mới nhất
          const lastOrders = sortedOrders.slice(0, 5);
          setRecentOrders(lastOrders);

          const newest = lastOrders[0];
          console.log('Latest order:', newest); // Debug log
          console.log('Last checked order ID:', lastCheckedOrderId); // Debug log
          
          // Kiểm tra nếu có đơn hàng mới
          if (newest && lastCheckedOrderId && newest._id !== lastCheckedOrderId) {
            console.log('New order detected!'); // Debug log
            setShow(true);
            setTimeout(() => setShow(false), 4000);
          }
          
          // Cập nhật ID đơn hàng cuối cùng đã kiểm tra
          if (newest) {
            setLatestOrder(newest);
            setLastCheckedOrderId(newest._id);
          }

          // Đếm số đơn hàng chờ xử lý
          const pendingOrders = data.filter((order: Order) => order.status === "Chờ xử lý");
          setNewOrderCount(pendingOrders.length);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    // Chạy ngay lập tức
    fetchLatestOrders();
    
    // Thiết lập interval để kiểm tra mỗi 5 giây
    intervalRef.current = setInterval(fetchLatestOrders, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setNewOrderCount]); // Chỉ phụ thuộc vào setNewOrderCount

  const handleToastClick = () => {
    if (latestOrder) {
      navigate(`/orders/${latestOrder._id}`);
    }
  };

  const handleOrderClick = (id: string) => {
    navigate(`/orders/${id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="p-6">
      {/* Toast Notification */}
      {show && latestOrder && (
        <div className="notify-toast" onClick={handleToastClick} style={{ cursor: "pointer" }}>
          <span>
            🔔 Đơn hàng mới: <b>{latestOrder.order_code}</b>
            {latestOrder.user_id?.name && <> - Khách: {latestOrder.user_id.name}</>}
            {" - "}Tổng: {latestOrder.total_price?.toLocaleString()}đ
          </span>
          <div style={{ fontSize: 12, color: "#eee" }}>(Bấm để xem chi tiết)</div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Thông báo đơn hàng</h2>
        <p className="text-gray-600">Danh sách các đơn hàng mới nhất</p>
      </div>

      {/* Debug Info (có thể xóa sau khi test xong) */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>Latest Order ID: {latestOrder?._id || 'None'}</p>
        <p>Last Checked ID: {lastCheckedOrderId || 'None'}</p>
        <p>Total Orders: {recentOrders.length}</p>
        <p>Auto-refresh: 5 seconds</p>
      </div>

      {/* Latest Orders Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="mr-2">🆕</span>
            5 Đơn hàng mới nhất
          </h3>
          <span className="text-sm text-gray-500">
            Cập nhật tự động mỗi 5 giây
          </span>
        </div>

        {/* Orders Cards View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {recentOrders.length > 0 ? (
            recentOrders.map((order, index) => (
              <div 
                key={order._id} 
                className={`bg-white rounded-lg shadow-md p-4 border-l-4 transition-all hover:shadow-lg ${
                  index === 0 ? 'border-l-green-500 bg-green-50' : 
                  index === 1 ? 'border-l-blue-500 bg-blue-50' : 
                  index === 2 ? 'border-l-yellow-500 bg-yellow-50' : 
                  'border-l-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-blue-500' : 
                      index === 2 ? 'bg-yellow-500' : 
                      'bg-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {order.order_code}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === "Chờ xử lý" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {order.status || "Chờ xử lý"}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-medium">{order.user_id?.name || "Ẩn danh"}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-bold text-green-600">
                      {order.total_price?.toLocaleString()}đ
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="text-gray-500">{formatDate(order.createdAt)}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button 
                    className="w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                    onClick={() => handleOrderClick(order._id)}
                  >
                    👁️ Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">Không có đơn hàng nào</p>
              <p className="text-gray-400 text-sm">Đơn hàng mới sẽ xuất hiện ở đây</p>
            </div>
          )}
        </div>

        {/* Orders Table View */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h4 className="text-sm font-medium text-gray-700">Bảng chi tiết</h4>
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
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button 
          onClick={() => {
            setLastCheckedOrderId(null); // Reset để force check lại
            window.location.reload();
          }}
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
      </div>
    </div>
  );
};

export default Notify;
