import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaTruck, FaClipboardList, FaChartBar, FaExclamationTriangle, FaMapMarkedAlt } from 'react-icons/fa';
import { shipperStatisticsService } from '../../services/shipperService';
import { ShipperStatistics } from '../../interfaces/shipper';
import '../../css/shippers/shipperManagement.css';

const ShipperManagementPage: React.FC = () => {
  const [statistics, setStatistics] = useState<ShipperStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await shipperStatisticsService.getShiperStatistics();
      setStatistics(data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const managementCards = [
    {
      title: 'Quản lý Shipper',
      description: 'Danh sách, thêm, sửa, xóa và xác minh shipper',
      icon: <FaUsers />,
      link: '/shippers/list',
      color: 'primary'
    },
    {
      title: 'Gán đơn hàng',
      description: 'Gán đơn hàng cho shipper và theo dõi trạng thái',
      icon: <FaTruck />,
      link: '/shippers/orders',
      color: 'success'
    },
    {
      title: 'Theo dõi hoạt động',
      description: 'Theo dõi vị trí và hoạt động của shipper',
      icon: <FaMapMarkedAlt />,
      link: '/shippers/tracking',
      color: 'info'
    },
    {
      title: 'Báo cáo sự cố',
      description: 'Xem và xử lý các báo cáo từ shipper',
      icon: <FaExclamationTriangle />,
      link: '/shippers/reports',
      color: 'warning'
    },
    {
      title: 'Thống kê & Báo cáo',
      description: 'Báo cáo hiệu suất và thống kê giao hàng',
      icon: <FaChartBar />,
      link: '/shippers/statistics',
      color: 'secondary'
    },
    {
      title: 'Quản lý thanh toán COD',
      description: 'Theo dõi và xác nhận thanh toán COD',
      icon: <FaClipboardList />,
      link: '/shippers/payments',
      color: 'danger'
    }
  ];

  if (loading) {
    return (
      <div className="shipper-management-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shipper-management-page">
      <div className="page-header">
        <h1>Quản lý Shipper</h1>
        <p>Quản lý, giám sát và hỗ trợ hoạt động giao hàng của shipper</p>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <div className="statistics-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>{statistics.totalShipers}</h3>
                <p>Tổng số shipper</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon active">
                <FaTruck />
              </div>
              <div className="stat-content">
                <h3>{statistics.activeShipers}</h3>
                <p>Shipper đang hoạt động</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success">
                <FaClipboardList />
              </div>
              <div className="stat-content">
                <h3>{statistics.completedOrders}</h3>
                <p>Đơn hàng hoàn thành</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning">
                <FaExclamationTriangle />
              </div>
              <div className="stat-content">
                <h3>{statistics.failedOrders}</h3>
                <p>Đơn hàng thất bại</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon info">
                <FaChartBar />
              </div>
              <div className="stat-content">
                <h3>{statistics.successRate.toFixed(1)}%</h3>
                <p>Tỷ lệ thành công</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon primary">
                <FaClipboardList />
              </div>
              <div className="stat-content">
                <h3>{statistics.totalCodAmount.toLocaleString('vi-VN')}đ</h3>
                <p>Tổng tiền COD</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Management Cards */}
      <div className="management-section">
        <h2>Chức năng quản lý</h2>
        <div className="management-grid">
          {managementCards.map((card, index) => (
            <Link to={card.link} key={index} className="management-card">
              <div className={`card-icon ${card.color}`}>
                {card.icon}
              </div>
              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="card-arrow">
                →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Thao tác nhanh</h2>
        <div className="quick-actions">
          <Link to="/shippers/add" className="quick-action-btn primary">
            <FaUsers />
            <span>Thêm shipper mới</span>
          </Link>
          <Link to="/shippers/orders" className="quick-action-btn success">
            <FaTruck />
            <span>Gán đơn hàng</span>
          </Link>
          <Link to="/shippers/reports" className="quick-action-btn warning">
            <FaExclamationTriangle />
            <span>Xem báo cáo sự cố</span>
          </Link>
          <button className="quick-action-btn info">
            <FaChartBar />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipperManagementPage;
