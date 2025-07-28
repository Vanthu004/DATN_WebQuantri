import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllVouchers,
  deleteVoucherByVoucherId,
} from "../../services/voucher";
import { VoucherData } from "../../services/voucher";

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

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách voucher</h2>
        <button
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
          onClick={() => navigate("/addvouchers")}
        >
          Thêm voucher
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-500">Đang tải dữ liệu...</div>
      ) : vouchers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-lg">
          Không có voucher nào.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b">#</th>
                <th className="px-4 py-2 border-b">Mã voucher</th>
                <th className="px-4 py-2 border-b">Loại</th>
                <th className="px-4 py-2 border-b">Giảm giá</th>
                <th className="px-4 py-2 border-b">Lượt dùng</th>
                <th className="px-4 py-2 border-b">HSD</th>
                <th className="px-4 py-2 border-b">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher, index) => (
                <tr key={voucher._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{index + 1}</td>
                  <td className="px-4 py-2 border-b">{voucher.voucher_id || voucher._id}</td>
                  <td className="px-4 py-2 border-b">
                    {voucher.User_id ? "Cá nhân" : "Dùng chung"}
                  </td>
                  <td className="px-4 py-2 border-b">{voucher.discount_value.toLocaleString()}%</td>
                  <td className="px-4 py-2 border-b">{voucher.usage_limit}</td>
                  <td className="px-4 py-2 border-b">{formatDate(voucher.expiry_date)}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      className="action-btn edit"
                      onClick={() =>
                        navigate(`/updatevouchers/${voucher.voucher_id || voucher._id}`)
                      }
                    >
                      Sửa
                    </button>
                    {" | "}
                    <button
                      className="action-btn delete"
                      onClick={() =>
                        handleDelete(voucher.voucher_id || voucher._id!)
                      }
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListVoucher;
