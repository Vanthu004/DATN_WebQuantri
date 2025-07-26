import React, { useEffect, useState } from "react";
import { createVoucher } from "../../services/voucher";
import { getAllUsers } from "../../services/user";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
      setUsers(data);
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

    const payload: any = {
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
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Thêm voucher</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Loại voucher */}
        <div className="flex items-center space-x-4">
          <label className="font-medium">Loại voucher:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "all" | "personal")}
            className="border border-gray-300 px-3 py-2 rounded w-full"
          >
            <option value="all">Dùng chung</option>
            <option value="personal">Cá nhân</option>
          </select>
        </div>

        {/* Mã voucher (tuỳ chọn) */}
        <div>
          <label className="block font-medium mb-1">Mã voucher (tuỳ chọn)</label>
          <input
            type="text"
            className="border border-gray-300 px-3 py-2 rounded w-full"
            placeholder="VD: VOUCHER2025"
            value={voucherId}
            onChange={(e) => setVoucherId(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">Nếu để trống, hệ thống sẽ tự sinh mã</p>
        </div>

        {/* Giá trị giảm */}
        <div>
          <label className="block font-medium mb-1">Giá trị giảm (%)</label>
          <input
            type="number"
            className="border border-gray-300 px-3 py-2 rounded w-full"
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            min={1}
            required
          />
        </div>

        {/* Số lượt sử dụng */}
        <div>
          <label className="block font-medium mb-1">Số lượt sử dụng</label>
          <input
            type="number"
            className="border border-gray-300 px-3 py-2 rounded w-full"
            value={usageLimit}
            onChange={(e) => setUsageLimit(Number(e.target.value))}
            min={1}
            required
          />
        </div>

        {/* Ngày hết hạn */}
        <div>
          <label className="block font-medium mb-1">Ngày hết hạn</label>
          <input
            type="date"
            className="border border-gray-300 px-3 py-2 rounded w-full"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>

        {/* Danh sách người dùng (nếu là cá nhân) */}
        {type === "personal" && (
          <div>
            <label className="block font-medium mb-1">
              Người dùng áp dụng ({users.length})
            </label>
            {loadingUsers ? (
              <p className="text-gray-500">Đang tải danh sách...</p>
            ) : (
              <ul className="max-h-40 overflow-y-auto text-sm bg-gray-50 border p-2 rounded">
                {users.map((u) => (
                  <li key={u._id}>
                    {u.name || "Không tên"} ({u._id})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Thêm voucher
        </button>
      </form>
    </div>
  );
};

export default AddVoucher;
