import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../services/order";
import {
  getOrderDetailsByOrderId,
  deleteOrderDetail,
} from "../../services/orderDetail";
import Order from "../../interfaces/order";
import { OrderDetail as OrderDetailType } from "../../interfaces/order";
import ToastMessage from "../../components/ToastMessage";
import "../../css/orders/orderDetail.css";

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
    
    const loadOrderData = async () => {
      try {
        const [orderData, detailResponse] = await Promise.all([
          getOrderById(id),
          getOrderDetailsByOrderId(id)
        ]);
        
        setOrder(orderData);
        if (detailResponse.success) {
          setDetails(detailResponse.data.details);
        }
      } catch (error) {
        setToast({ 
          type: "error", 
          message: "Không tải được dữ liệu đơn hàng!" 
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [id]);

  const handleDeleteDetail = async (detailId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi đơn hàng?"))
      return;
    
    try {
      const response = await deleteOrderDetail(detailId);
      if (response.success) {
        setDetails((prev) => prev.filter((d) => d._id !== detailId));
        setToast({
          type: "success",
          message: "Đã xóa sản phẩm khỏi đơn hàng!",
        });
      }
    } catch (error) {
      setToast({ type: "error", message: "Xóa thất bại!" });
    }
  };

  const getVariantDisplay = (detail: OrderDetailType) => {
    if (detail.variant_info) {
      const parts = [];
      if (detail.variant_info.size?.name) parts.push(detail.variant_info.size.name);
      if (detail.variant_info.color?.name) parts.push(detail.variant_info.color.name);
      return parts.length > 0 ? parts.join(' - ') : null;
    }
    
    if (typeof detail.product_variant_id === 'object' && detail.product_variant_id) {
      const variant = detail.product_variant_id;
      const parts = [];
      if (variant.attributes?.size?.name) parts.push(variant.attributes.size.name);
      if (variant.attributes?.color?.name) parts.push(variant.attributes.color.name);
      return parts.length > 0 ? parts.join(' - ') : null;
    }
    
    return null;
  };

  const getProductImage = (detail: OrderDetailType) => {
    if (detail.product_image) return detail.product_image;
    if (typeof detail.product_id === 'object' && detail.product_id?.image_url) {
      return detail.product_id.image_url;
    }
    if (typeof detail.product_variant_id === 'object' && detail.product_variant_id?.image_url) {
      return detail.product_variant_id.image_url;
    }
    return null;
  };

  const getProductName = (detail: OrderDetailType) => {
    if (typeof detail.product_id === 'object' && detail.product_id?.name) {
      return detail.product_id.name;
    }
    return detail.product_name;
  };

  const getStatusDisplayClass = (status: string) => {
    const statusMap: Record<string, string> = {
      "Chờ xử lý": "pending",
      "Đã xác nhận": "confirmed", 
      "Đang vận chuyển": "shipping",
      "Đã giao hàng": "delivered",
      "Hoàn thành": "completed",
      "Đã hủy": "cancelled"
    };
    return statusMap[status] || "default";
  };

  if (loading) return <div className="loading">Đang tải chi tiết đơn hàng...</div>;
  if (!order) return <div className="error-message">Không tìm thấy đơn hàng.</div>;

  return (
    <div className="order-detail-page">
      <div className="order-detail-header">
        <button
          onClick={() => navigate(-1)}
          className="btn-back"
        >
          ← Quay lại
        </button>
        <h2>Chi tiết đơn hàng</h2>
      </div>

      {toast && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="order-info-section">
        <div className="order-info-grid">
          {/* Nhóm 1: Thông tin cơ bản đơn hàng */}
          <div className="info-item">
            <label>Mã đơn hàng:</label>
            <span>{order.order_code}</span>
          </div>
          
          <div className="info-item">
            <label>Ngày tạo:</label>
            <span>
              {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : "-"}
            </span>
          </div>
          
          <div className="info-item">
            <label>Trạng thái:</label>
            <span className={`status-badge status-${getStatusDisplayClass(order.status)}`}>
              {order.status}
            </span>
          </div>
          
          {/* Nhóm 2: Thông tin khách hàng */}
          <div className="info-item">
            <label>Khách hàng:</label>
            <span>
              {typeof order.user_id === "object" &&
              order.user_id !== null &&
              "name" in order.user_id
                ? order.user_id.name
                : order.user_id}
            </span>
          </div>
          
          <div className="info-item">
            <label>Số điện thoại:</label>
            <span>
              {order.shipping_address ? (() => {
                // Thử nhiều cách để lấy số điện thoại từ địa chỉ giao hàng
                const phoneMatch = order.shipping_address.match(/^(\d[\d\s\-\(\)]+)/);
                if (phoneMatch) {
                  return phoneMatch[1].trim();
                }
                
                // Nếu không có số ở đầu, thử tìm số điện thoại trong chuỗi
                const anyPhoneMatch = order.shipping_address.match(/(\d{10,11})/);
                if (anyPhoneMatch) {
                  return anyPhoneMatch[1];
                }
                
                return 'N/A';
              })() : 'N/A'}
            </span>
          </div>
          
          <div className="info-item">
            <label>Địa chỉ giao hàng:</label>
            <span>
              {order.shipping_address ? 
                order.shipping_address.replace(/^[^-]*-\s*/, '').replace(/^[0-9\s\-\(\)]+/, '') : 'N/A'}
            </span>
          </div>
          
          {/* Nhóm 3: Trạng thái đơn hàng */}
          <div className="info-item">
            <label>Thanh toán:</label>
            <span className={`status-badge payment-${order.payment_status || 'default'}`}>
              {order.payment_status === 'pending' && 'Chờ thanh toán'}
              {order.payment_status === 'paid' && 'Đã thanh toán'}
              {order.payment_status === 'failed' && 'Thanh toán thất bại'}
              {order.payment_status === 'refunded' && 'Đã hoàn tiền'}
              {!order.payment_status && 'N/A'}
            </span>
          </div>
          
          <div className="info-item">
            <label>Vận chuyển:</label>
            <span className={`status-badge shipping-${order.shipping_status || 'default'}`}>
              {order.shipping_status === 'pending' && 'Chờ vận chuyển'}
              {order.shipping_status === 'shipped' && 'Đang vận chuyển'}
              {order.shipping_status === 'delivered' && 'Đã giao hàng'}
              {order.shipping_status === 'returned' && 'Đã trả hàng'}
              {!order.shipping_status && 'N/A'}
            </span>
          </div>
          
          <div className="info-item">
            <label>Số lượng sản phẩm:</label>
            <span>{order.total_quantity || order.item_count || 0} sản phẩm</span>
          </div>
          
          {/* Nhóm 4: Hình thức thanh toán và vận chuyển */}
          <div className="info-item">
            <label>Hình thức thanh toán:</label>
            <span>
              {typeof order.paymentmethod_id === "object" && order.paymentmethod_id ? (
                order.paymentmethod_id.name
              ) : (
                'N/A'
              )}
            </span>
          </div>
          
          <div className="info-item">
            <label>Hình thức vận chuyển:</label>
            <span>
              {typeof order.shippingmethod_id === "object" && order.shippingmethod_id ? (
                <>
                  {order.shippingmethod_id.name}
                  {order.shippingmethod_id.estimated_days && (
                    <span className="shipping-speed">
                      {order.shippingmethod_id.estimated_days <= 2 ? ' (Ship nhanh)' : ' (Ship thường)'}
                    </span>
                  )}
                </>
              ) : (
                'N/A'
              )}
            </span>
          </div>
          
          {/* Nhóm 5: Thông tin giá */}
          <div className="info-item">
            <label>Tổng tiền:</label>
            <span>{order.total_price.toLocaleString()}₫</span>
          </div>
          
          <div className="info-row">
            {order.voucher_id && (
              <div className="info-item">
                <label>Voucher sử dụng:</label>
                <div className="voucher-display">
                  <span className="voucher-title">
                    {typeof order.voucher_id === "object" && order.voucher_id ? (
                      order.voucher_id.title
                    ) : (
                      'N/A'
                    )}
                  </span>
                  <span className="voucher-discount">
                    {typeof order.voucher_id === "object" && order.voucher_id ? (
                      `(Giảm ${order.voucher_id.discount_value.toLocaleString()}₫)`
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
              </div>
            )}
            
            {/* Ghi chú nếu có */}
            {order.note && (
              <div className="info-item">
                <label>Ghi chú:</label>
                <span>{order.note}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="order-details-section">
        <h3>Sản phẩm trong đơn hàng</h3>
        
        {details.length === 0 ? (
          <div className="no-items">
            <p>Không có sản phẩm nào trong đơn hàng này.</p>
          </div>
        ) : (
          <div className="order-items">
            {details.map((item) => (
              <div key={item._id} className="order-item">
                <div className="item-image">
                  <img 
                    src={getProductImage(item) || '/placeholder-product.png'} 
                    alt={getProductName(item)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.png';
                    }}
                  />
                </div>
                
                <div className="item-info">
                  <h4 className="item-name">{getProductName(item)}</h4>
                  {getVariantDisplay(item) && (
                    <div className="item-variant">
                      <span className="variant-label">Biến thể:</span>
                      <span className="variant-value">{getVariantDisplay(item)}</span>
                    </div>
                  )}
                  <div className="item-sku">
                    {item.variant_info?.sku && `SKU: ${item.variant_info.sku}`}
                  </div>
                </div>
                
                <div className="item-price">
                  <span className="price-label">Giá:</span>
                  <span className="price-value">{item.price_each.toLocaleString()}₫</span>
                </div>
                
                <div className="item-quantity">
                  <span className="quantity-label">Số lượng:</span>
                  <span className="quantity-value">{item.quantity}</span>
                </div>
                
                <div className="item-total">
                  <span className="total-label">Thành tiền:</span>
                  <span className="total-value">
                    {(item.price_each * item.quantity).toLocaleString()}₫
                  </span>
                </div>
                
                <div className="item-actions">
                  <button
                    onClick={() => handleDeleteDetail(item._id)}
                    className="btn-delete"
                    disabled={order.status === "Hoàn thành" || order.status === "Đã hủy"}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
