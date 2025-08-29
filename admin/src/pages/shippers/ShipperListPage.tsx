import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaEye, FaEdit, FaCheck, FaTimes, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { shipperService } from '../../services/shipperService';
import { Shipper } from '../../interfaces/shipper';
import '../../css/shippers/shipperList.css';

const ShipperListPage: React.FC = () => {
  const [shippers, setShipers] = useState<Shipper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    verificationStatus: '',
    workingStatus: '',
    city: '',
    district: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchShipers();
  }, [currentPage, filters]);

  const fetchShipers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      const response = await shipperService.getAllShipers(params);
      setShipers(response.data.shipers);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching shippers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (shipperId: string, newStatus: string) => {
    try {
      await shipperService.updateShiperStatus(shipperId, newStatus);
      fetchShipers(); // Refresh the list
    } catch (error) {
      console.error('Error updating shipper status:', error);
    }
  };

  const handleVerification = async (shipperId: string, verificationStatus: string) => {
    try {
      await shipperService.verifyShiper(shipperId, { verificationStatus });
      fetchShipers(); // Refresh the list
    } catch (error) {
      console.error('Error verifying shipper:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      verificationStatus: '',
      workingStatus: '',
      city: '',
      district: ''
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Hoạt động', className: 'status-active' },
      inactive: { label: 'Không hoạt động', className: 'status-inactive' },
      suspended: { label: 'Tạm ngưng', className: 'status-suspended' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  const getVerificationBadge = (status: string) => {
    const verificationConfig = {
      pending: { label: 'Chờ xác minh', className: 'verification-pending' },
      verified: { label: 'Đã xác minh', className: 'verification-verified' },
      rejected: { label: 'Từ chối', className: 'verification-rejected' }
    };
    const config = verificationConfig[status as keyof typeof verificationConfig] || { label: status, className: 'verification-default' };
    return <span className={`verification-badge ${config.className}`}>{config.label}</span>;
  };

  const getWorkingStatusBadge = (status: string) => {
    const workingConfig = {
      online: { label: 'Trực tuyến', className: 'working-online' },
      offline: { label: 'Ngoại tuyến', className: 'working-offline' },
      busy: { label: 'Bận', className: 'working-busy' }
    };
    const config = workingConfig[status as keyof typeof workingConfig] || { label: status, className: 'working-default' };
    return <span className={`working-badge ${config.className}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="shipper-list-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách shipper...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shipper-list-page">
      <div className="page-header">
        <h1>Danh sách Shipper</h1>
        <Link to="/shippers/add" className="add-shipper-btn">
          Thêm Shipper mới
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
                aria-label="Lọc theo trạng thái shipper"
              >
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="suspended">Tạm ngưng</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="verification-filter">Xác minh:</label>
              <select
                id="verification-filter"
                value={filters.verificationStatus}
                onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                aria-label="Lọc theo trạng thái xác minh"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ xác minh</option>
                <option value="verified">Đã xác minh</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="working-status-filter">Trạng thái làm việc:</label>
              <select
                id="working-status-filter"
                value={filters.workingStatus}
                onChange={(e) => handleFilterChange('workingStatus', e.target.value)}
                aria-label="Lọc theo trạng thái làm việc"
              >
                <option value="">Tất cả</option>
                <option value="online">Trực tuyến</option>
                <option value="offline">Ngoại tuyến</option>
                <option value="busy">Bận</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Thành phố:</label>
              <input
                type="text"
                placeholder="Nhập thành phố"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Quận/Huyện:</label>
              <input
                type="text"
                placeholder="Nhập quận/huyện"
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button className="clear-filters-btn" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Shipper List */}
      <div className="shipper-list">
        <div className="list-header">
          <div className="header-cell">Thông tin</div>
          <div className="header-cell">Phương tiện</div>
          <div className="header-cell">Trạng thái</div>
          <div className="header-cell">Hiệu suất</div>
          <div className="header-cell">Thao tác</div>
        </div>

        {shippers.map((shipper) => (
          <div key={shipper._id} className="shipper-item">
            <div className="shipper-info">
              <div className="shipper-avatar">
                {shipper.user.avatar ? (
                  <img src={shipper.user.avatar} alt={shipper.user.fullName} />
                ) : (
                  <div className="avatar-placeholder">
                    {shipper.user.fullName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="shipper-details">
                <h3>{shipper.user.fullName}</h3>
                <div className="contact-info">
                  <span><FaPhone /> {shipper.user.phone}</span>
                  <span><FaEnvelope /> {shipper.user.email}</span>
                </div>
                <div className="location-info">
                  <span><FaMapMarkerAlt /> {shipper.currentLocation.address}</span>
                </div>
              </div>
            </div>

            <div className="vehicle-info">
              <div className="vehicle-type">{shipper.vehicleInfo.type}</div>
              <div className="vehicle-details">
                {shipper.vehicleInfo.brand} {shipper.vehicleInfo.model}
              </div>
              {shipper.vehicleInfo.licensePlate && (
                <div className="license-plate">{shipper.vehicleInfo.licensePlate}</div>
              )}
            </div>

            <div className="status-section">
              <div className="status-badges">
                {getStatusBadge(shipper.status)}
                {getVerificationBadge(shipper.verificationStatus)}
                {getWorkingStatusBadge(shipper.workingStatus)}
              </div>
              <div className="verification-actions">
                {shipper.verificationStatus === 'pending' && (
                  <>
                    <button
                      className="verify-btn success"
                      onClick={() => handleVerification(shipper._id, 'verified')}
                    >
                      <FaCheck /> Duyệt
                    </button>
                    <button
                      className="verify-btn danger"
                      onClick={() => handleVerification(shipper._id, 'rejected')}
                    >
                      <FaTimes /> Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="performance-info">
              <div className="performance-item">
                <span className="label">Đánh giá:</span>
                <span className="rating">{shipper.rating.toFixed(1)} ⭐</span>
              </div>
              <div className="performance-item">
                <span className="label">Thành công:</span>
                <span className="success-rate">{shipper.successfulDeliveries}/{shipper.totalDeliveries}</span>
              </div>
              <div className="performance-item">
                <span className="label">Thu nhập:</span>
                <span className="earnings">{shipper.totalEarnings.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="actions">
              <Link to={`/shippers/${shipper._id}`} className="action-btn view">
                <FaEye />
                <span>Xem</span>
              </Link>
              <Link to={`/shippers/${shipper._id}/edit`} className="action-btn edit">
                <FaEdit />
                <span>Sửa</span>
              </Link>
              <button
                className={`action-btn ${shipper.status === 'active' ? 'suspend' : 'activate'}`}
                onClick={() => handleStatusUpdate(shipper._id, shipper.status === 'active' ? 'suspended' : 'active')}
              >
                {shipper.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
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

export default ShipperListPage;
