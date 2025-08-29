import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTruck, FaUser, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaEye, FaPhone } from 'react-icons/fa';
import { shipperOrderService, shipperService } from '../../services/shipperService';
import { ShipperOrder, Shipper } from '../../interfaces/shipper';
import '../../css/shippers/orderAssignment.css';

const OrderAssignmentPage: React.FC = () => {
  const [ordersToAssign, setOrdersToAssign] = useState<ShipperOrder[]>([]);
  const [availableShipers, setAvailableShipers] = useState<Shipper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    district: '',
    paymentMethod: '',
    orderValue: ''
  });
  const [selectedOrder, setSelectedOrder] = useState<ShipperOrder | null>(null);
  const [selectedShipper, setSelectedShipper] = useState<string>('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrdersToAssign();
    fetchAvailableShipers();
  }, [currentPage, filters]);

  const fetchOrdersToAssign = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      const response = await shipperOrderService.getOrdersToAssign(params);
      setOrdersToAssign(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching orders to assign:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableShipers = async () => {
    try {
      const response = await shipperService.getActiveShipers();
      setAvailableShipers(response.data.shipers);
    } catch (error) {
      console.error('Error fetching available shippers:', error);
    }
  };

  const handleAssignOrder = async () => {
    if (!selectedOrder || !selectedShipper) return;

    try {
      await shipperOrderService.assignOrder(selectedOrder.orderId, selectedShipper);
      setShowAssignmentModal(false);
      setSelectedOrder(null);
      setSelectedShipper('');
      fetchOrdersToAssign(); // Refresh the list
      fetchAvailableShipers(); // Refresh available shippers
    } catch (error) {
      console.error('Error assigning order:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      district: '',
      paymentMethod: '',
      orderValue: ''
    });
    setCurrentPage(1);
  };

  const openAssignmentModal = (order: ShipperOrder) => {
    setSelectedOrder(order);
    setSelectedShipper('');
    setShowAssignmentModal(true);
  };

  const getPaymentMethodIcon = (method: string) => {
    if (method.toLowerCase().includes('cod')) {
      return <FaMoneyBillWave className="payment-icon cod" />;
    }
    return <FaMoneyBillWave className="payment-icon online" />;
  };

  const getOrderValueClass = (value: number) => {
    if (value >= 1000000) return 'high-value';
    if (value >= 500000) return 'medium-value';
    return 'low-value';
  };

  if (loading) {
    return (
      <div className="order-assignment-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-assignment-page">
      <div className="page-header">
        <h1>Gán đơn hàng cho Shipper</h1>
        <p>Quản lý việc gán đơn hàng cho shipper và theo dõi trạng thái giao hàng</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="city-filter">Thành phố:</label>
            <input
              id="city-filter"
              type="text"
              placeholder="Nhập thành phố"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="district-filter">Quận/Huyện:</label>
            <input
              id="district-filter"
              type="text"
              placeholder="Nhập quận/huyện"
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="payment-filter">Phương thức thanh toán:</label>
            <select
              id="payment-filter"
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              aria-label="Lọc theo phương thức thanh toán"
            >
              <option value="">Tất cả</option>
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              <option value="online">Thanh toán trực tuyến</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="value-filter">Giá trị đơn hàng:</label>
            <select
              id="value-filter"
              value={filters.orderValue}
              onChange={(e) => handleFilterChange('orderValue', e.target.value)}
              aria-label="Lọc theo giá trị đơn hàng"
            >
              <option value="">Tất cả</option>
              <option value="low">Dưới 500,000đ</option>
              <option value="medium">500,000đ - 1,000,000đ</option>
              <option value="high">Trên 1,000,000đ</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button className="clear-filters-btn" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-section">
        <h2>Đơn hàng chờ gán ({ordersToAssign.length})</h2>
        
        <div className="orders-grid">
          {ordersToAssign.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-number">
                  <strong>#{order.order.orderNumber}</strong>
                </div>
                <div className="order-time">
                  <FaClock />
                  <span>{new Date(order.assignedAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              <div className="customer-info">
                <div className="customer-name">
                  <FaUser />
                  <span>{order.order.customer.fullName}</span>
                </div>
                <div className="customer-phone">
                  <FaPhone />
                  <span>{order.order.customer.phone}</span>
                </div>
              </div>

              <div className="delivery-address">
                <FaMapMarkerAlt />
                <span>{order.order.deliveryAddress.address}</span>
                <div className="address-details">
                  {order.order.deliveryAddress.district}, {order.order.deliveryAddress.city}
                </div>
              </div>

              <div className="order-details">
                <div className="order-items">
                  <strong>Sản phẩm:</strong>
                  <div className="items-list">
                    {order.order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="item">
                        <img src={item.product.image} alt={item.product.name} />
                        <span>{item.product.name} x{item.quantity}</span>
                      </div>
                    ))}
                    {order.order.items.length > 2 && (
                      <div className="more-items">
                        +{order.order.items.length - 2} sản phẩm khác
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-summary">
                  <div className="total-amount">
                    <span className="label">Tổng tiền:</span>
                    <span className={`amount ${getOrderValueClass(order.order.totalAmount)}`}>
                      {order.order.totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="payment-method">
                    <span className="label">Thanh toán:</span>
                    <span className="method">
                      {getPaymentMethodIcon(order.order.paymentMethod)}
                      {order.order.paymentMethod}
                    </span>
                  </div>
                  {order.codAmount > 0 && (
                    <div className="cod-amount">
                      <span className="label">Tiền COD:</span>
                      <span className="amount cod">{order.codAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="order-actions">
                <button
                  className="assign-btn"
                  onClick={() => openAssignmentModal(order)}
                >
                  <FaTruck />
                  Gán Shipper
                </button>
                <button className="view-details-btn">
                  <FaEye />
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Trước
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowAssignmentModal(false)}>
          <div className="assignment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Gán đơn hàng cho Shipper</h3>
              <button
                className="close-btn"
                onClick={() => setShowAssignmentModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="order-summary-modal">
                <h4>Thông tin đơn hàng #{selectedOrder.order.orderNumber}</h4>
                <div className="summary-details">
                  <p><strong>Khách hàng:</strong> {selectedOrder.order.customer.fullName}</p>
                  <p><strong>Địa chỉ:</strong> {selectedOrder.order.deliveryAddress.address}</p>
                  <p><strong>Tổng tiền:</strong> {selectedOrder.order.totalAmount.toLocaleString('vi-VN')}đ</p>
                  <p><strong>Phương thức:</strong> {selectedOrder.order.paymentMethod}</p>
                </div>
              </div>

              <div className="shipper-selection">
                <label htmlFor="shipper-select">Chọn Shipper:</label>
                <select
                  id="shipper-select"
                  value={selectedShipper}
                  onChange={(e) => setSelectedShipper(e.target.value)}
                  aria-label="Chọn shipper để gán đơn hàng"
                >
                  <option value="">-- Chọn Shipper --</option>
                  {availableShipers.map((shipper) => (
                    <option key={shipper._id} value={shipper._id}>
                      {shipper.user.fullName} - {shipper.vehicleInfo.type} - {shipper.currentLocation.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowAssignmentModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="confirm-btn"
                  disabled={!selectedShipper}
                  onClick={handleAssignOrder}
                >
                  Gán đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderAssignmentPage;
