import { useEffect, useState } from "react";
import { getAllOrders, updateOrder } from "../../services/order";
import Order from "../../interfaces/order";
import "../../css/orders/order.css";
import ToastMessage from "../../components/ToastMessage";
import { useNavigate } from "react-router-dom";

type PopulatedUser = { name: string; email?: string; phone?: string; address?: string; _id: string };

const statusOptions = [
  "Chờ xử lý",
  "Đã xác nhận",
  "Đang vận chuyển",
  "Đã giao hàng",
  "Hoàn thành",
  "Đã hủy",
];

const paymentStatusOptions = [
  { value: "pending", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "failed", label: "Thanh toán thất bại" },
  { value: "refunded", label: "Đã hoàn tiền" },
];

const shippingStatusOptions = [
  { value: "pending", label: "Chờ vận chuyển" },
  { value: "shipped", label: "Đang vận chuyển" },
  { value: "delivered", label: "Đã giao hàng" },
  { value: "returned", label: "Đã trả hàng" },
];

// Logic kiểm tra trạng thái hợp lệ giống backend
const validTransitions: Record<string, string[]> = {
  "Chờ xử lý": ["Đã xác nhận", "Đã hủy"],
  "Đã xác nhận": ["Đang vận chuyển", "Đã hủy"],
  "Đang vận chuyển": ["Đã giao hàng", "Đã hủy"],
  "Đã giao hàng": ["Hoàn thành", "Đã hủy"],
  "Hoàn thành": [],
  "Đã hủy": [],
};

function isValidStatusTransition(current: string, next: string) {
  if (current === next) return true;
  return validTransitions[current]?.includes(next);
}

const OrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  // Pagination và filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    payment_status: "",
    shipping_status: "",
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders(
        filters.status || undefined,
        filters.payment_status || undefined,
        filters.shipping_status || undefined,
        currentPage,
        10
      );
      
      if (response.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
        setTotalOrders(response.data.pagination.total);
      }
    } catch (error) {
      setToast({
        type: "error",
        message: "Lỗi tải danh sách đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, filters]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await updateOrder(id, { status });
      if (response.success) {
        setOrders((orders) =>
          orders.map((order) =>
            order._id === id ? { ...order, status: response.data.status } : order
          )
        );
        setToast({
          type: "success",
          message: "Cập nhật trạng thái thành công!",
        });
      }
    } catch (error: any) {
      setToast({
        type: "error",
        message: error?.response?.data?.msg || "Cập nhật trạng thái thất bại!",
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset về trang đầu khi filter
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses = {
      "Chờ xử lý": "status-pending",
      "Đã xác nhận": "status-confirmed",
      "Đang vận chuyển": "status-shipping",
      "Đã giao hàng": "status-delivered",
      "Hoàn thành": "status-completed",
      "Đã hủy": "status-cancelled",
    };
    return statusClasses[status as keyof typeof statusClasses] || "status-default";
  };

  const getPaymentStatusBadgeClass = (status?: string) => {
    const statusClasses = {
      "pending": "payment-pending",
      "paid": "payment-paid",
      "failed": "payment-failed",
      "refunded": "payment-refunded",
    };
    return statusClasses[status as keyof typeof statusClasses] || "payment-default";
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="order-page">
      <div className="order-header">
        <h2>Danh sách đơn hàng</h2>
        <div className="order-stats">
          <span>Tổng cộng: {totalOrders} đơn hàng</span>
        </div>
      </div>

      {toast && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Trạng thái đơn hàng:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">Tất cả</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Trạng thái thanh toán:</label>
          <select
            value={filters.payment_status}
            onChange={(e) => handleFilterChange("payment_status", e.target.value)}
          >
            <option value="">Tất cả</option>
            {paymentStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Trạng thái vận chuyển:</label>
          <select
            value={filters.shipping_status}
            onChange={(e) => handleFilterChange("shipping_status", e.target.value)}
          >
            <option value="">Tất cả</option>
            {shippingStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Vận chuyển</th>
              <th>Tổng tiền</th>
              <th>Số lượng SP</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="no-data">
                  Không có đơn hàng nào
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td className="order-code">{order.order_code}</td>
                  <td className="customer-info">
                    {typeof order.user_id === "object" &&
                    order.user_id !== null &&
                    "name" in order.user_id
                      ? (order.user_id as PopulatedUser).name
                      : order.user_id}
                    {typeof order.user_id === "object" &&
                    order.user_id !== null &&
                    "phone" in order.user_id &&
                    (order.user_id as PopulatedUser).phone && (
                      <div className="customer-phone">
                        {(order.user_id as PopulatedUser).phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="status-select"
                    >
                      {statusOptions.map((status) => {
                        const disabled = !isValidStatusTransition(
                          order.status,
                          status
                        );
                        return (
                          <option
                            key={status}
                            value={status}
                            disabled={disabled}
                            className={disabled ? "option-disabled" : ""}
                          >
                            {status}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${getPaymentStatusBadgeClass(order.payment_status)}`}>
                      {paymentStatusOptions.find(opt => opt.value === order.payment_status)?.label || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getPaymentStatusBadgeClass(order.shipping_status)}`}>
                      {shippingStatusOptions.find(opt => opt.value === order.shipping_status)?.label || "N/A"}
                    </span>
                  </td>
                  <td className="total-price">
                    {order.total_price.toLocaleString()}₫
                  </td>
                  <td className="item-count">
                    {order.item_count || 0} SP
                    {order.has_variants && <span className="variant-indicator">*</span>}
                  </td>
                  <td className="created-date">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : "-"}
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="btn-view"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Trước
          </button>
          
          <span className="pagination-info">
            Trang {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
