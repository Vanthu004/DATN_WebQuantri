import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllVouchers,
  deleteVoucherByVoucherId,
  VoucherData,
} from "../../services/voucher";
import "../../css/voucher/listVoucher.css";


const ListVoucher = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [loading, setLoading] = useState(false);

  const [filterType, setFilterType] = useState<"all" | "personal" | "shared">("all");
  const [filterDiscountType, setFilterDiscountType] = useState<"all" | "product" | "free_shipping">("all");
  const [filterExpired, setFilterExpired] = useState<"all" | "expired" | "valid">("all");
  const [filterUsage, setFilterUsage] = useState<"all" | "used_up" | "available">("all");
  const [searchUserName, setSearchUserName] = useState("");

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await getAllVouchers();
      if (Array.isArray(data)) {
        const uniqueMap = new Map<string, VoucherData>();
        data.forEach((voucher) => {

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
    date ? new Date(date).toLocaleDateString("vi-VN") : "--";

  const filteredVouchers = vouchers.filter((voucher) => {
    if (filterType === "personal" && !voucher.User_id) return false;
    if (filterType === "shared" && voucher.User_id) return false;

    // Lọc loại trừ miễn phí vận chuyển nếu filter là 'product'
    if (filterDiscountType === "product" && voucher.title === "Miễn phí vận chuyển") return false;
    if (filterDiscountType === "free_shipping" && voucher.title !== "Miễn phí vận chuyển") return false;

    if (filterExpired === "expired" && new Date(voucher.expiry_date) > new Date()) return false;
    if (filterExpired === "valid" && new Date(voucher.expiry_date) <= new Date()) return false;

if (filterUsage === "used_up") {
  // Lọc voucher đã dùng hết hoặc có usage_limit = 0 (không còn lượt dùng)
  if ((voucher.usage_limit ?? 0) === 0 || (voucher.used_count ?? 0) >= (voucher.usage_limit ?? 0)) {
    // Đây là voucher dùng hết lượt hoặc usage_limit = 0 nên giữ lại
  } else {
    return false; // Bỏ qua voucher chưa dùng hết
  }
}

if (filterUsage === "available") {
  // Lọc voucher còn lượt dùng (usage_limit > 0 và used_count < usage_limit)
  if ((voucher.usage_limit ?? 0) > 0 && (voucher.used_count ?? 0) < (voucher.usage_limit ?? 0)) {
    // Đây là voucher còn lượt dùng, giữ lại
  } else {
    return false; // Bỏ qua voucher đã dùng hết hoặc usage_limit=0
  }
}

    if (searchUserName.trim() && voucher.User_id) {
      return voucher.User_id.name?.toLowerCase().includes(searchUserName.toLowerCase());
    }

    return true;
  });

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
      {/* Bộ lọc */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label>Loại voucher:</label>
          <select
            className="ml-2 border rounded p-1"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">Tất cả</option>
            <option value="personal">Cá nhân</option>
            <option value="shared">Dùng chung</option>
          </select>
        </div>

        <div>
          <label>Loại ưu đãi:</label>
          <select
            className="ml-2 border rounded p-1"
            value={filterDiscountType}
            onChange={(e) => setFilterDiscountType(e.target.value as any)}
          >
            <option value="all">Tất cả</option>
            <option value="product">Giảm giá sản phẩm</option>
            <option value="free_shipping">Miễn phí vận chuyển</option>
          </select>
        </div>

        <div>
          <label>Trạng thái hạn:</label>
          <select
            className="ml-2 border rounded p-1"
            value={filterExpired}
            onChange={(e) => setFilterExpired(e.target.value as any)}
          >
            <option value="all">Tất cả</option>
            <option value="valid">Còn hạn</option>
            <option value="expired">Hết hạn</option>
          </select>
        </div>

        <div>
          <label>Tình trạng lượt dùng:</label>
          <select
            className="ml-2 border rounded p-1"
            value={filterUsage}
            onChange={(e) => setFilterUsage(e.target.value as any)}
          >
            <option value="all">Tất cả</option>
            <option value="available">Còn lượt dùng</option>
            <option value="used_up">Hết lượt dùng</option>
          </select>
        </div>

        <div>
          <label>Tên người dùng:</label>
          <input
            type="text"
            className="ml-2 border rounded p-1"
            placeholder="Nhập tên người dùng"
            value={searchUserName}
            onChange={(e) => setSearchUserName(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng voucher */}
      {loading ? (
        <div className="text-center py-6 text-gray-500">Đang tải dữ liệu...</div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-lg">
          Không có voucher nào.
        </div>
      ) : (
        <div className="table-container">
          <table className="voucher-table">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">#</th>
                <th className="px-4 py-2 border-b">Mã voucher</th>
                <th className="px-4 py-2 border-b">Tiêu đề</th>
                <th className="px-4 py-2 border-b">Loại</th>
                <th className="px-4 py-2 border-b">Người dùng</th>
                <th className="px-4 py-2 border-b">Giảm giá</th>
                <th className="px-4 py-2 border-b">Đã dùng / Tổng</th>
                <th className="px-4 py-2 border-b">HSD</th>
                <th className="px-4 py-2 border-b">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((voucher, index) => (
                <tr key={voucher._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{index + 1}</td>
                  <td className="px-4 py-2 border-b">{voucher.voucher_id || voucher._id}</td>
                  <td className="px-4 py-2 border-b">{voucher.title}</td>
                  <td className="px-4 py-2 border-b">
                    {voucher.User_id ? "Cá nhân" : "Dùng chung"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {voucher.User_id?.name || "--"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {voucher.title === "Miễn phí vận chuyển"
                      ? "Miễn phí"
                      : `${voucher.discount_value.toLocaleString()}%`}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {(voucher.used_count ?? 0).toLocaleString()} /{" "}
                    {voucher.usage_limit?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {formatDate(voucher.expiry_date)}
                  </td>
                  <td className="px-4 py-2 border-b">
                    <button
                      className="action-btn edit"
                      onClick={() =>
                        navigate(`/updatevouchers/${voucher.voucher_id || voucher._id}`)
                      }
                    >
                      Sửa
                    </button>{" "}
                    |{" "}
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
