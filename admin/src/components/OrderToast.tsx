import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaTimes, FaShoppingCart } from "react-icons/fa";
import "../css/notify/orderToast.css";

interface Order {
  _id: string;
  order_code: string;
  total_price: number;
  user_id?: { name?: string; email?: string };
  createdAt?: string;
  status?: string;
}

interface OrderToastProps {
  order: Order | null;
  isVisible: boolean;
  onClose: () => void;
  onViewOrder: (orderId: string) => void;
}

const OrderToast: React.FC<OrderToastProps> = ({
  order,
  isVisible,
  onClose,
  onViewOrder,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Tự động ẩn sau 8 giây
      const timer = setTimeout(() => {
        onClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleViewOrder = () => {
    if (order) {
      onViewOrder(order._id);
      onClose();
    }
  };

  const handleViewAllOrders = () => {
    navigate('/notify');
    onClose();
  };

  if (!isVisible || !order) return null;

  return (
    <div className={`order-toast ${isAnimating ? 'show' : ''}`}>
      <div className="order-toast-content">
        <div className="order-toast-header">
          <div className="order-toast-icon">
            <FaBell className="bell-icon" />
          </div>
          <div className="order-toast-title">
            <h4>🆕 Đơn hàng mới!</h4>
            <p className="order-code">{order.order_code}</p>
          </div>
          <button className="order-toast-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="order-toast-body">
          <div className="order-info">
            <div className="info-row">
              <span className="label">Khách hàng:</span>
              <span className="value">{order.user_id?.name || "Ẩn danh"}</span>
            </div>
            <div className="info-row">
              <span className="label">Tổng tiền:</span>
              <span className="value price">
                {order.total_price?.toLocaleString()}đ
              </span>
            </div>
            <div className="info-row">
              <span className="label">Thời gian:</span>
              <span className="value">
                {new Date(order.createdAt || '').toLocaleString('vi-VN')}
              </span>
            </div>
          </div>

          <div className="order-toast-actions">
            <button 
              className="btn-view-order"
              onClick={handleViewOrder}
            >
              <FaShoppingCart />
              Xem đơn hàng
            </button>
            <button 
              className="btn-view-all"
              onClick={handleViewAllOrders}
            >
              Xem tất cả
            </button>
          </div>
        </div>

        <div className="order-toast-progress">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default OrderToast; 