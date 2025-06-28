import { useEffect, useState } from "react";
import { getAllOrders, updateOrder } from "../../services/order";
import Order from "../../interfaces/order";
import "../../css/orders/order.css";

type PopulatedUser = { name: string; email?: string; _id: string };

const statusOptions = [
  "Chờ xử lý",
  "Đã xác nhận",
  "Đang vận chuyển",
  "Đã giao hàng",
  "Hoàn thành",
  "Đã hủy",
];

const OrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      })
      .catch(() => alert("Cập nhật trạng thái thất bại!"));
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2>Danh sách đơn hàng</h2>
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
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td>{order.total_price.toLocaleString()}₫</td>
              <td>{/* Có thể thêm nút xem chi tiết, xóa... */}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderPage;
