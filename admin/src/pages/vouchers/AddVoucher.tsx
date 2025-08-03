import React, { useEffect, useState } from "react";
import { createVoucher } from "../../services/voucher";
import { getAllUsers } from "../../services/user";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../css/vouchers/addVoucher.css";

interface CreateVoucherPayload {
  discount_value: number;
  usage_limit: number;
  expiry_date: string;
  status?: "active" | "inactive" | "expired";
  voucher_id?: string;
  userIds?: string[];
}

const AddVoucher = () => {
  const navigate = useNavigate();

  const [type, setType] = useState<"all" | "personal">("all");
  const [voucherId, setVoucherId] = useState<string>("");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [usageLimit, setUsageLimit] = useState<number>(1);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [users, setUsers] = useState<{ _id: string; name?: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      console.log("Danh sách users tải về:", data);
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách user:", error);
      toast.error("Không tải được danh sách người dùng");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (type === "personal") {
      fetchUsers();
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!discountValue || !usageLimit || !expiryDate) {
      toast.warning("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const payload: CreateVoucherPayload = {
      discount_value: discountValue,
      usage_limit: usageLimit,
      expiry_date: expiryDate,
      status: "active",
    };

    if (voucherId.trim() !== "") {
      payload.voucher_id = voucherId.trim();
    }

    if (type === "personal") {
      payload.userIds = users.map((u) => u._id);
    }

    console.log("Payload gửi lên API tạo voucher:", payload);

    try {
      await createVoucher(payload);
      toast.success("Thêm voucher thành công");
      navigate("/vouchers");
    } catch (err) {
      console.error("Lỗi khi tạo voucher:", err);
      toast.error("Thêm voucher thất bại");
    }
  };

  return (
    <div className="add-voucher-container">
      <div className="add-voucher-form-container">
        {/* Header */}
        <div className="add-voucher-header">
          <h2 className="add-voucher-title">🎫 Thêm Voucher Mới</h2>
          <p className="add-voucher-subtitle">Tạo voucher để khuyến mãi cho khách hàng</p>
        </div>

        {/* Form Body */}
        <div className="add-voucher-form-body">
          <form onSubmit={handleSubmit} className="add-voucher-form">
            {/* Loại voucher */}
            <div className="form-group">
              <label className="form-label form-label-required">Loại Voucher</label>
              <div className="voucher-type-selector">
                <div 
                  className={`voucher-type-option ${type === 'all' ? 'selected' : ''}`}
                  onClick={() => setType('all')}
                >
                  🌍 Dùng Chung
                </div>
                <div 
                  className={`voucher-type-option ${type === 'personal' ? 'selected' : ''}`}
                  onClick={() => setType('personal')}
                >
                  👤 Cá Nhân
                </div>
              </div>
              <p className="form-help-text">
                {type === 'all' ? 'Voucher có thể sử dụng cho tất cả khách hàng' : 'Voucher chỉ dành cho người dùng được chọn'}
              </p>
            </div>

            {/* Mã voucher (tuỳ chọn) */}
            <div className="form-group">
              <label className="form-label">Mã Voucher</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: VOUCHER2025, SALE50, ..."
                value={voucherId}
                onChange={(e) => setVoucherId(e.target.value)}
              />
              <p className="form-help-text">Nếu để trống, hệ thống sẽ tự động sinh mã ngẫu nhiên</p>
            </div>

            {/* Giá trị giảm và Số lượt sử dụng */}
            <div className="form-group-row">
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
                  placeholder="10"
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Số Lượt Sử Dụng</label>
                <input
                  type="number"
                  className="form-input"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  min={1}
                  required
                  placeholder="100"
                />
              </div>
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
              <p className="form-help-text">Chọn ngày voucher sẽ hết hiệu lực</p>
            </div>

            {/* Danh sách người dùng (nếu là cá nhân) */}
            {type === "personal" && (
              <div className="form-group">
                <label className="form-label">
                  👥 Người Dùng Áp Dụng ({users.length} người)
                </label>
                <div className="users-list-container">
                  {loadingUsers ? (
                    <div className="loading-users">
                      ⏳ Đang tải danh sách người dùng...
                    </div>
                  ) : (
                    <ul className="users-list">
                      {users.map((u) => (
                        <li key={u._id}>
                          👤 {u.name || "Không tên"} 
                          <span style={{ color: '#6b7280', fontSize: '11px', marginLeft: '8px' }}>
                            ({u._id.slice(-8)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="form-help-text">
                  Voucher sẽ chỉ áp dụng cho những người dùng được liệt kê ở trên
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="submit-btn">
              ✨ Tạo Voucher
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVoucher;
