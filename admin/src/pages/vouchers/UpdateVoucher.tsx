import React, { useState, useEffect } from "react";
import { getVoucherByVoucherId, updateVoucherByVoucherId, VoucherData } from "../../services/voucher";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../../css/vouchers/updateVoucher.css";

const EditVoucher = () => {
  const { voucher_id } = useParams<{ voucher_id: string }>();
  const navigate = useNavigate();

  const [discountValue, setDiscountValue] = useState<number>(0);
  const [usageLimit, setUsageLimit] = useState<number>(1);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentVoucher, setCurrentVoucher] = useState<VoucherData | null>(null);

  useEffect(() => {
    const fetchVoucher = async () => {
      if (!voucher_id) return;
      setLoading(true);
      try {
        const data = await getVoucherByVoucherId(voucher_id);
        if (data.length === 0) {
          toast.error("Không tìm thấy voucher");
          navigate("/vouchers");
          return;
        }
        const voucher = data[0]; // lấy voucher đầu tiên
        setCurrentVoucher(voucher);
        setDiscountValue(voucher.discount_value);
        setUsageLimit(voucher.usage_limit);
        setExpiryDate(voucher.expiry_date ? voucher.expiry_date.split("T")[0] : ""); // chuyển ISO -> yyyy-mm-dd
        setStatus(voucher.status || "active");
      } catch (error) {
        toast.error("Không tìm thấy voucher");
        navigate("/vouchers");
      } finally {
        setLoading(false);
      }
    };
    fetchVoucher();
  }, [voucher_id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!discountValue || !usageLimit || !expiryDate) {
      toast.warning("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      await updateVoucherByVoucherId(voucher_id!, {
        discount_value: discountValue,
        usage_limit: usageLimit,
        expiry_date: expiryDate,
      });
      toast.success("Cập nhật voucher thành công");
      navigate("/vouchers");
    } catch (err) {
      toast.error("Cập nhật voucher thất bại");
    }
  };

  if (loading) {
    return (
      <div className="update-voucher-container">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <div className="loading-text">Đang tải dữ liệu voucher...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="update-voucher-container">
      <div className="update-voucher-form-container">
        {/* Header */}
        <div className="update-voucher-header">
          <h2 className="update-voucher-title">✏️ Cập Nhật Voucher</h2>
          <p className="update-voucher-subtitle">
            Chỉnh sửa thông tin voucher: {currentVoucher?.voucher_id || currentVoucher?._id}
          </p>
        </div>

        {/* Form Body */}
        <div className="update-voucher-form-body">
          <form onSubmit={handleSubmit} className="update-voucher-form">
            {/* Mã voucher (readonly) */}
            <div className="form-group">
              <label className="form-label">Mã Voucher</label>
              <div className="current-value">
                🎫 {currentVoucher?.voucher_id || currentVoucher?._id}
              </div>
              <p className="form-help-text">Mã voucher không thể thay đổi</p>
            </div>

            {/* Giá trị giảm */}
            <div className="form-group">
              <label className="form-label form-label-required">Giá Trị Giảm (%)</label>
              <input
                type="number"
                className="form-input"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                min={1}
                max={100}
                required
                placeholder="Nhập giá trị giảm..."
              />
              <p className="form-help-text">Giá trị từ 1% đến 100%</p>
            </div>

            {/* Số lượt sử dụng */}
            <div className="form-group">
              <label className="form-label form-label-required">Số Lượt Sử Dụng</label>
              <input
                type="number"
                className="form-input"
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                min={1}
                required
                placeholder="Nhập số lượt sử dụng..."
              />
              <p className="form-help-text">Số lần voucher có thể được sử dụng</p>
            </div>

            {/* Ngày hết hạn */}
            <div className="form-group">
              <label className="form-label form-label-required">Ngày Hết Hạn</label>
              <input
                type="date"
                className="form-input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="form-help-text">Ngày voucher sẽ hết hiệu lực</p>
            </div>

            {/* Trạng thái */}
            <div className="form-group">
              <label className="form-label">Trạng Thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
              >
                <option value="active">🟢 Hoạt động</option>
                <option value="inactive">🔴 Không hoạt động</option>
                <option value="expired">⏰ Hết hạn</option>
              </select>
              <p className="form-help-text">Trạng thái hiện tại của voucher</p>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="back-btn"
                onClick={() => navigate("/vouchers")}
              >
                ← Quay Lại
              </button>
              <button type="submit" className="submit-btn">
                💾 Cập Nhật Voucher
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVoucher;
