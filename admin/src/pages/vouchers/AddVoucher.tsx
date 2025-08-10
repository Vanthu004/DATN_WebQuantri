import React, { useEffect, useState } from "react";
import { createVoucher } from "../../services/voucher";
import { getAllUsers } from "../../services/user";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../css/voucher/addVoucher.css";
const AddVoucher = () => {
  const navigate = useNavigate();

  const [type, setType] = useState<"all" | "personal">("all");
  const [discountValue, setDiscountValue] = useState<number>(1);
  const [title, setTitle] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<number>(1);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [voucherOption, setVoucherOption] = useState<"product" | "free_shipping">("product");
  const [users, setUsers] = useState<{ _id: string; name?: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users nếu loại voucher là cá nhân
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Không tải được danh sách người dùng");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (type === "personal") {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [type]);

  // Tự động cập nhật tiêu đề và giá trị giảm khi chọn loại voucher
  useEffect(() => {
    if (voucherOption === "free_shipping") {
      setTitle("Miễn phí vận chuyển");
      setDiscountValue(0);
    } else {
      setTitle("");
      setDiscountValue(1);
    }
  }, [voucherOption]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !usageLimit || !expiryDate) {
      toast.warning("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    const payload: any = {
      title,

      discount_value: discountValue,
      usage_limit: usageLimit,
      expiry_date: expiryDate,
      status: "active",
      isPersonal: type === "personal",
    };

    if (type === "personal") {
      payload.userIds = users.map((u) => u._id);
    }

    console.log("Payload gửi lên:", payload);

    try {
      await createVoucher(payload);
      toast.success("Thêm voucher thành công");
      navigate("/vouchers");
    } catch (err) {
      toast.error("Thêm voucher thất bại");
    }
  };

  return (
    <div className="add-voucher-container">
      <h2 className="add-voucher-title">Thêm voucher</h2>

      <form onSubmit={handleSubmit} className="add-voucher-form">
        {/* Loại voucher */}
        <div>
          <label>Loại voucher:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "all" | "personal")}
          >
            <option value="all">Dùng chung</option>
            <option value="personal">Cá nhân</option>
          </select>
        </div>

        {/* Loại ưu đãi */}
        <div>
          <label>Loại ưu đãi</label>
          <select
            value={voucherOption}
            onChange={(e) =>
              setVoucherOption(e.target.value as "product" | "free_shipping")
            }
          >
            <option value="product">Giảm giá sản phẩm</option>
            <option value="free_shipping">Miễn phí vận chuyển</option>
          </select>
        </div>

        {/* Tiêu đề */}
        <div>
          <label>Tiêu đề</label>
          <input
            type="text"
            placeholder="Nhập tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            readOnly={voucherOption === "free_shipping"}
            required
          />
        </div>

        {/* Giá trị giảm (chỉ khi loại product) */}
        {voucherOption === "product" && (
          <div>
            <label>Giá trị giảm (%)</label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              min={1}
              required
            />
          </div>
        )}

        {/* Số lượt sử dụng */}
        <div>
          <label>Số lượt sử dụng</label>
          <input
            type="number"
            value={usageLimit}
            onChange={(e) => setUsageLimit(Number(e.target.value))}
            min={1}
            required
          />
        </div>

        {/* Ngày hết hạn */}
        <div>
          <label>Ngày hết hạn</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>

        {/* Danh sách người dùng nếu cá nhân */}
        {type === "personal" && (
          <div>
            <label>Người dùng áp dụng ({users.length})</label>
            {loadingUsers ? (
              <p className="add-voucher-hint">Đang tải danh sách...</p>
            ) : (
              <ul className="add-voucher-users">
                {users.map((u) => (
                  <li key={u._id}>
                    {u.name || "Không tên"} ({u._id})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button type="submit" className="add-voucher-submit">
          Thêm voucher
        </button>
      </form>
    </div>
  );
};

export default AddVoucher;
