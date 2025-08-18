import React, { useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaTruck, FaMoneyBillWave, FaClock, FaMapMarkerAlt, FaDownload } from 'react-icons/fa';
import { shipperStatisticsService } from '../../services/shipperService';
import { ShipperStatistics, ShipperPerformance } from '../../interfaces/shipper';
import '../../css/shippers/shipperStatistics.css';

const ShipperStatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<ShipperStatistics | null>(null);
  const [performance, setPerformance] = useState<ShipperPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  useEffect(() => {
    fetchStatistics();
    fetchPerformance();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      const response = await shipperStatisticsService.getShiperStatistics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await shipperStatisticsService.getShiperPerformance({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: 10,
        sortBy: 'totalOrders',
        sortOrder: 'desc'
      });
      setPerformance(response.data.performance);
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const response = await shipperStatisticsService.exportReport({
        type: format,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format: format
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shipper-statistics-${dateRange.startDate}-${dateRange.endDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="shipper-statistics-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shipper-statistics-page">
      <div className="page-header">
        <h1>Thống kê & Báo cáo Shipper</h1>
        <p>Phân tích hiệu suất và thống kê giao hàng của shipper</p>
      </div>

      {/* Date Range Selector */}
      <div className="date-range-section">
        <div className="date-inputs">
          <div className="date-input">
            <label htmlFor="start-date">Từ ngày:</label>
            <input
              id="start-date"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="date-input">
            <label htmlFor="end-date">Đến ngày:</label>
            <input
              id="end-date"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
        <div className="export-actions">
          <button
            className="export-btn excel"
            onClick={() => handleExport('excel')}
          >
            <FaDownload />
            Xuất Excel
          </button>
          <button
            className="export-btn pdf"
            onClick={() => handleExport('pdf')}
          >
            <FaDownload />
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Overview Statistics */}
      {statistics && (
        <div className="overview-section">
          <h2>Tổng quan</h2>
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
                <FaChartBar />
              </div>
              <div className="stat-content">
                <h3>{statistics.totalOrders}</h3>
                <p>Tổng đơn hàng</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning">
                <FaClock />
              </div>
              <div className="stat-content">
                <h3>{statistics.averageDeliveryTime.toFixed(0)} phút</h3>
                <p>Thời gian giao trung bình</p>
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
                <FaMoneyBillWave />
              </div>
              <div className="stat-content">
                <h3>{statistics.totalCodAmount.toLocaleString('vi-VN')}đ</h3>
                <p>Tổng tiền COD</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COD Payment Statistics */}
      {statistics && (
        <div className="cod-section">
          <h2>Thống kê thanh toán COD</h2>
          <div className="cod-stats">
            <div className="cod-stat-item">
              <div className="cod-stat-value">{statistics.collectedCodAmount.toLocaleString('vi-VN')}đ</div>
              <div className="cod-stat-label">Đã thu</div>
            </div>
            <div className="cod-stat-item">
              <div className="cod-stat-value">{statistics.submittedCodAmount.toLocaleString('vi-VN')}đ</div>
              <div className="cod-stat-label">Đã nộp</div>
            </div>
            <div className="cod-stat-item">
              <div className="cod-stat-value">{statistics.outstandingCodAmount.toLocaleString('vi-VN')}đ</div>
              <div className="cod-stat-label">Chưa nộp</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Table */}
      <div className="performance-section">
        <h2>Bảng xếp hạng hiệu suất</h2>
        <div className="performance-table">
          <div className="table-header">
            <div className="header-cell">Thứ hạng</div>
            <div className="header-cell">Shipper</div>
            <div className="header-cell">Đơn hàng</div>
            <div className="header-cell">Tỷ lệ thành công</div>
            <div className="header-cell">Thời gian TB</div>
            <div className="header-cell">Thu nhập</div>
            <div className="header-cell">Đánh giá</div>
          </div>
          
          {performance.map((shipper, index) => (
            <div key={shipper.shipperId} className="table-row">
              <div className="rank-cell">
                <span className={`rank-badge rank-${index + 1}`}>
                  {index + 1}
                </span>
              </div>
              <div className="shipper-cell">
                <div className="shipper-name">{shipper.shipperName}</div>
                <div className="shipper-details">
                  <span className="cod-info">
                    COD: {shipper.totalCodCollected.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
              <div className="orders-cell">
                <div className="total-orders">{shipper.totalOrders}</div>
                <div className="order-breakdown">
                  <span className="completed">✓ {shipper.completedOrders}</span>
                  <span className="failed">✗ {shipper.failedOrders}</span>
                </div>
              </div>
              <div className="success-cell">
                <div className="success-rate">{shipper.successRate.toFixed(1)}%</div>
                <div className="success-bar">
                  <div 
                    className="success-fill" 
                    style={{ width: `${shipper.successRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="time-cell">
                {shipper.averageDeliveryTime.toFixed(0)} phút
              </div>
              <div className="earnings-cell">
                {shipper.totalEarnings.toLocaleString('vi-VN')}đ
              </div>
              <div className="rating-cell">
                <span className="rating-stars">
                  {'⭐'.repeat(Math.round(shipper.rating))}
                </span>
                <span className="rating-value">{shipper.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section Placeholder */}
      <div className="charts-section">
        <h2>Biểu đồ phân tích</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Xu hướng giao hàng theo ngày</h3>
            <div className="chart-placeholder">
              <FaChartBar />
              <p>Biểu đồ sẽ được hiển thị ở đây</p>
            </div>
          </div>
          <div className="chart-card">
            <h3>Phân bố đơn hàng theo khu vực</h3>
            <div className="chart-placeholder">
              <FaMapMarkerAlt />
              <p>Biểu đồ sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipperStatisticsPage;
