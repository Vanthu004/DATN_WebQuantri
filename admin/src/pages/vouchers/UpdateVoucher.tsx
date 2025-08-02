import React, { useState, useEffect } from "react";
import { getVoucherByVoucherId, updateVoucherByVoucherId } from "../../services/voucher";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const EditVoucher = () => {
  const { voucher_id } = useParams<{ voucher_id: string }>();
  const navigate = useNavigate();

  const [discountValue, setDiscountValue] = useState<number>(0);
  const [usageLimit, setUsageLimit] = useState<number>(1);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchVoucher = async () => {
      if (!voucher_id) return;
      setLoading(true);
      try {
        const data = await getVoucherByVoucherId(voucher_id);
        if (data.length === 0) {
          toast.error("Không tìm thấy voucher");
          return;
        }
        const voucher = data[0]; // lấy voucher đầu tiên
        setDiscountValue(voucher.discount_value);
        setUsageLimit(voucher.usage_limit);
        setExpiryDate(voucher.expiry_date ? voucher.expiry_date.split("T")[0] : ""); // chuyển ISO -> yyyy-mm-dd
        setStatus(voucher.status || "active");
      } catch (error) {
        toast.error("Không tìm thấy voucher");
      } finally {
        setLoading(false);
      }
    };
    fetchVoucher();
  }, [voucher_id]);

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

  if (loading) return <div>Đang tải dữ liệu voucher...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Cập nhật voucher</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div>
          <label className="block font-medium mb-1">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded w-full"
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="expired">Hết hạn</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Cập nhật voucher
        </button>
      </form>
    </div>
  );
};

export default EditVoucher;
