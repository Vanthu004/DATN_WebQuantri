import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaEye, FaCheck, FaTimes, FaClock, FaMapMarkerAlt, FaFilter, FaSearch } from 'react-icons/fa';
import { shipperReportService } from '../../services/shipperService';
import { ShipperReport } from '../../interfaces/shipper';
import '../../css/shippers/shipperReports.css';

const ShipperReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ShipperReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    severity: '',
    shipperId: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [currentPage, filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      const response = await shipperReportService.getShiperReports(params);
      setReports(response.data.reports);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      await shipperReportService.updateReportStatus(reportId, {
        status: newStatus,
        adminNotes: 'Cập nhật trạng thái báo cáo'
      });
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      type: '',
      severity: '',
      shipperId: ''
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: 'Mở', className: 'status-open' },
      in_progress: { label: 'Đang xử lý', className: 'status-progress' },
      resolved: { label: 'Đã giải quyết', className: 'status-resolved' },
      closed: { label: 'Đã đóng', className: 'status-closed' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      incident: { label: 'Sự cố', className: 'type-incident' },
      address_issue: { label: 'Vấn đề địa chỉ', className: 'type-address' },
      damaged_goods: { label: 'Hàng hóa bị hư', className: 'type-damaged' },
      customer_issue: { label: 'Vấn đề khách hàng', className: 'type-customer' },
      other: { label: 'Khác', className: 'type-other' }
    };
    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, className: 'type-default' };
    return <span className={`type-badge ${config.className}`}>{config.label}</span>;
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { label: 'Thấp', className: 'severity-low' },
      medium: { label: 'Trung bình', className: 'severity-medium' },
      high: { label: 'Cao', className: 'severity-high' },
      critical: { label: 'Nghiêm trọng', className: 'severity-critical' }
    };
    const config = severityConfig[severity as keyof typeof severityConfig] || { label: severity, className: 'severity-default' };
    return <span className={`severity-badge ${config.className}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="shipper-reports-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shipper-reports-page">
      <div className="page-header">
        <h1>Báo cáo sự cố từ Shipper</h1>
        <p>Quản lý và xử lý các báo cáo từ shipper</p>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
          Bộ lọc
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="status-filter">Trạng thái:</label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="open">Mở</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="type-filter">Loại báo cáo:</label>
              <select
                id="type-filter"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="incident">Sự cố</option>
                <option value="address_issue">Vấn đề địa chỉ</option>
                <option value="damaged_goods">Hàng hóa bị hư</option>
                <option value="customer_issue">Vấn đề khách hàng</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="severity-filter">Mức độ:</label>
              <select
                id="severity-filter"
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="critical">Nghiêm trọng</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button className="clear-filters-btn" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="reports-list">
        <div className="list-header">
          <div className="header-cell">Thông tin báo cáo</div>
          <div className="header-cell">Shipper</div>
          <div className="header-cell">Mức độ & Loại</div>
          <div className="header-cell">Trạng thái</div>
          <div className="header-cell">Thao tác</div>
        </div>

        {reports.map((report) => (
          <div key={report._id} className="report-item">
            <div className="report-info">
              <h3>{report.title}</h3>
              <p className="description">{report.description}</p>
              <div className="report-meta">
                <span className="timestamp">
                  <FaClock /> {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                </span>
                {report.location && (
                  <span className="location">
                    <FaMapMarkerAlt /> {report.location.address}
                  </span>
                )}
              </div>
            </div>

            <div className="shipper-info">
              <h4>{report.shipper.fullName}</h4>
              <p>{report.shipper.phone}</p>
            </div>

            <div className="report-classification">
              {getSeverityBadge(report.severity)}
              {getTypeBadge(report.type)}
            </div>

            <div className="status-section">
              {getStatusBadge(report.status)}
              <div className="status-actions">
                {report.status === 'open' && (
                  <>
                    <button
                      className="status-btn progress"
                      onClick={() => handleStatusUpdate(report._id, 'in_progress')}
                    >
                      <FaClock /> Xử lý
                    </button>
                  </>
                )}
                {report.status === 'in_progress' && (
                  <>
                    <button
                      className="status-btn resolved"
                      onClick={() => handleStatusUpdate(report._id, 'resolved')}
                    >
                      <FaCheck /> Giải quyết
                    </button>
                  </>
                )}
                {report.status === 'resolved' && (
                  <button
                    className="status-btn closed"
                    onClick={() => handleStatusUpdate(report._id, 'closed')}
                  >
                    <FaTimes /> Đóng
                  </button>
                )}
              </div>
            </div>

            <div className="actions">
              <button className="action-btn view">
                <FaEye />
                <span>Xem chi tiết</span>
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
  );
};

export default ShipperReportsPage;
