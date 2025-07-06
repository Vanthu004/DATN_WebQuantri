import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/notify/notify.css";

interface Order {
  _id: string;
  order_code: string;
  total_price: number;
  user_id?: { name?: string; email?: string };
  createdAt?: string;
  // ... các trường khác nếu cần
}

const Notify = () => {
  const [show, setShow] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestOrders = async () => {
      const res = await fetch("http://localhost:3000/api/orders");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Lấy 5 đơn hàng mới nhất (giả sử data đã sort theo thời gian tăng dần)
        const lastOrders = data.slice(-5).reverse(); // Đảo ngược để mới nhất lên đầu
        setRecentOrders(lastOrders);

        const newest = lastOrders[0];
        if (latestOrder && newest._id !== latestOrder._id) {
          setShow(true);
          setTimeout(() => setShow(false), 4000);
        }
        setLatestOrder(newest);
      }
    };

    intervalRef.current = setInterval(fetchLatestOrders, 10000);
    fetchLatestOrders();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [latestOrder]);

  const handleToastClick = () => {
    if (latestOrder) {
      navigate(`/orders/${latestOrder._id}`);
    }
  };

  const handleOrderClick = (id: string) => {
    navigate(`/orders/${id}`);
  };

  return (
    <div>
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

      <h2>Danh sách đơn hàng mới</h2>
      <table className="order-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Xem</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.map((order) => (
            <tr key={order._id}>
              <td>{order.order_code}</td>
              <td>{order.user_id?.name || "Ẩn danh"}</td>
              <td>{order.total_price?.toLocaleString()}đ</td>
              <td>
                <button className="order-view-btn" onClick={() => handleOrderClick(order._id)}>Xem</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Notify;
