import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../services/order";
import {
  getOrderDetailsByOrderId,
  deleteOrderDetail,
} from "../../services/orderDetail";
import Order from "../../interfaces/order";
import OrderDetailType from "../../interfaces/orderDetail";
import ToastMessage from "../../components/ToastMessage";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [details, setDetails] = useState<OrderDetailType[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getOrderById(id), getOrderDetailsByOrderId(id)])
      .then(([orderData, detailData]) => {
        setOrder(orderData);
        setDetails(detailData);
      })
      .catch(() =>
        setToast({ type: "error", message: "Không tải được dữ liệu đơn hàng!" })
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeleteDetail = (detailId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi đơn hàng?"))
      return;
    deleteOrderDetail(detailId)
      .then(() => {
        setDetails((prev) => prev.filter((d) => d._id !== detailId));
        setToast({
          type: "success",
          message: "Đã xóa sản phẩm khỏi đơn hàng!",
        });
      })
      .catch(() => setToast({ type: "error", message: "Xóa thất bại!" }));
  };

  if (loading) return <div>Đang tải chi tiết đơn hàng...</div>;
  if (!order) return <div>Không tìm thấy đơn hàng.</div>;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 16,
          background: "#f5f5f5",
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: "4px 12px",
          cursor: "pointer",
        }}
      >
        ← Quay lại
      </button>
      <h2>Chi tiết đơn hàng</h2>
      {toast && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <div style={{ marginBottom: 24 }}>
        <strong>Mã đơn:</strong> {order.order_code} <br />
        <strong>Khách hàng:</strong>{" "}
        {typeof order.user_id === "object" &&
        order.user_id !== null &&
        "name" in order.user_id
          ? order.user_id.name
          : order.user_id}{" "}
        <br />
        <strong>Trạng thái:</strong> {order.status} <br />
        <strong>Tổng tiền:</strong> {order.total_price.toLocaleString()}₫ <br />
        <strong>Ngày tạo:</strong>{" "}
        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
      </div>
      <h3>Sản phẩm trong đơn hàng</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fafbfc",
        }}
      >
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: 8, border: "1px solid #eee" }}>
              Tên sản phẩm
            </th>
            <th style={{ padding: 8, border: "1px solid #eee" }}>Giá</th>
            <th style={{ padding: 8, border: "1px solid #eee" }}>Số lượng</th>
            <th style={{ padding: 8, border: "1px solid #eee" }}>Thành tiền</th>
            <th style={{ padding: 8, border: "1px solid #eee" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {details.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
                Không có sản phẩm nào trong đơn hàng này.
              </td>
            </tr>
          ) : (
            details.map((item) => (
              <tr key={item._id}>
                <td style={{ padding: 8, border: "1px solid #eee" }}>
                  {typeof item.product_id === "object" &&
                  item.product_id !== null &&
                  "name" in item.product_id
                    ? item.product_id.name
                    : item.product_name}
                </td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>
                  {typeof item.product_id === "object" &&
                  item.product_id !== null &&
                  "price" in item.product_id
                    ? item.product_id.price.toLocaleString()
                    : item.product_price}
                  ₫
                </td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>
                  {item.quantity}
                </td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>
                  {(
                    (typeof item.product_id === "object" &&
                    item.product_id !== null &&
                    "price" in item.product_id
                      ? item.product_id.price
                      : item.product_price) * item.quantity
                  ).toLocaleString()}
                  ₫
                </td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>
                  <button
                    onClick={() => handleDeleteDetail(item._id)}
                    style={{
                      background: "#f44336",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetail;
