import { useEffect, useState } from "react";
import { getAllOrders, updateOrder } from "../../services/order";
import Order from "../../interfaces/order";
import "../../css/orders/order.css";
import ToastMessage from "../../components/ToastMessage";
import { useNavigate } from "react-router-dom";

type PopulatedUser = { name: string; email?: string; _id: string };

const statusOptions = [
  "Chờ xử lý",
  "Đã xác nhận",
  "Đang vận chuyển",
  "Đã giao hàng",
  "Hoàn thành",
  "Đã hủy",
];

// Logic kiểm tra trạng thái hợp lệ giống backend
const validTransitions: Record<string, string[]> = {
  "Chờ xử lý": ["Đã xác nhận", "Đã hủy", "Hoàn thành"],
  "Đã xác nhận": ["Đang vận chuyển"],
  "Đang vận chuyển": ["Đã giao hàng"],
  "Đã giao hàng": ["Hoàn thành"],
  "Hoàn thành": ["Đã hủy"],
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

  useEffect(() => {
    getAllOrders()
      .then((data) => setOrders(data))
      .catch(() => alert("Lỗi tải đơn hàng"))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (id: string, status: string) => {
    updateOrder(id, { status })
      .then((updated) => {
        setOrders((orders) =>
          orders.map((order) =>
            order._id === id ? { ...order, status: updated.status } : order
          )
        );
        setToast({
          type: "success",
          message: "Cập nhật trạng thái thành công!",
        });
      })
      .catch((err) => {
        setToast({
          type: "error",
          message: err?.response?.data?.msg || "Cập nhật trạng thái thất bại!",
        });
      });
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2>Danh sách đơn hàng</h2>
      {toast && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <table>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Trạng thái</th>
            <th>Tổng tiền</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.order_code}</td>
              <td>
                {typeof order.user_id === "object" &&
                order.user_id !== null &&
                "name" in order.user_id
                  ? (order.user_id as PopulatedUser).name
                  : order.user_id}
              </td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
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
              <td>{order.total_price.toLocaleString()}₫</td>
              <td>
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    background: "#f5f5f5",
                    cursor: "pointer",
                  }}
                >
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderPage;
