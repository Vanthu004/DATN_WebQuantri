import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllVouchers,
  deleteVoucherByVoucherId,
} from "../../services/voucher";
import { VoucherData } from "../../services/voucher";
import "../../css/vouchers/listVoucher.css";

const ListVoucher = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await getAllVouchers();
      if (Array.isArray(data)) {
        // Nhóm theo voucher_id và chỉ lấy một voucher đại diện
        const uniqueMap = new Map<string, VoucherData>();
        data.forEach((voucher) => {
          // Nếu voucher_id tồn tại, ưu tiên lấy voucher_id làm key
          const key = voucher.voucher_id || voucher._id!;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, voucher);
          }
        });
        setVouchers(Array.from(uniqueMap.values()));
      } else {
        setVouchers([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải voucher:", error);
      toast.error("Không thể tải danh sách voucher!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (voucher_id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) return;
    try {
      await deleteVoucherByVoucherId(voucher_id);
      toast.success("Đã xóa voucher!");
      fetchVouchers();
    } catch (error) {
      console.error(error);
      toast.error("Xóa voucher thất bại!");
    }
  };

  const formatDate = (date: string) =>
    date ? new Date(date).toLocaleString("vi-VN") : "--";

  const getVoucherStatus = (expiryDate: string) => {
    if (!expiryDate) return "unknown";
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "expired";
    if (diffDays <= 7) return "warning";
    return "active";
  };

  return (
    <div className="voucher-container">
      {/* Header */}
      <div className="voucher-header">
        <h2 className="voucher-title">🎫 Danh sách Voucher</h2>
        <button
          className="add-voucher-btn"
          onClick={() => navigate("/addvouchers")}
        >
          ➕ Thêm Voucher
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <div className="loading-text">Đang tải dữ liệu...</div>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="empty-container">
          <div className="empty-icon">🎫</div>
          <div className="empty-text">Không có voucher nào</div>
          <div className="empty-subtext">Hãy tạo voucher đầu tiên để bắt đầu</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="voucher-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Mã Voucher</th>
                <th>Loại</th>
                <th>Giảm Giá</th>
                <th>Lượt Dùng</th>
                <th>Hạn Sử Dụng</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher, index) => {
                const status = getVoucherStatus(voucher.expiry_date);
                return (
                  <tr key={voucher._id}>
                    <td className="row-number">{index + 1}</td>
                    <td>
                      <span className="voucher-id">
                        {voucher.voucher_id || voucher._id}
                      </span>
                    </td>
                    <td>
                      <span className={`voucher-type ${voucher.User_id ? 'personal' : 'public'}`}>
                        {voucher.User_id ? "Cá nhân" : "Dùng chung"}
                      </span>
                    </td>
                    <td>
                      <span className="discount-value">
                        {voucher.discount_value.toLocaleString()}%
                      </span>
                    </td>
                    <td className="usage-limit">
                      {voucher.usage_limit}
                    </td>
                    <td className="expiry-date">
                      {formatDate(voucher.expiry_date)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={`status-indicator status-${status}`}></span>
                        <span style={{ 
                          color: status === 'expired' ? '#ef4444' : 
                                 status === 'warning' ? '#f59e0b' : '#10b981',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {status === 'expired' ? 'Hết hạn' : 
                           status === 'warning' ? 'Sắp hết hạn' : 'Còn hiệu lực'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={() =>
                            navigate(`/updatevouchers/${voucher.voucher_id || voucher._id}`)
                          }
                        >
                          ✏️ Sửa
                        </button>
                        <span className="action-separator">|</span>
                        <button
                          className="action-btn delete"
                          onClick={() =>
                            handleDelete(voucher.voucher_id || voucher._id!)
                          }
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListVoucher;
