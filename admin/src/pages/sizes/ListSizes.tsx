import { useEffect, useState } from "react";
import { getAllSizes, softDeleteSize } from "../../services/size";
import { Size } from "../../interfaces/size";
import { useNavigate } from "react-router-dom";
import "../../css/size/listSize.css";

const ListSizes = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSizes();
    // eslint-disable-next-line
  }, [showDeleted]);

  const fetchSizes = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const data = await getAllSizes();
      setSizes(Array.isArray(data) ? data : []);
    } catch (error) {
      setSizes([]);
      setError("Không thể tải danh sách size!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa size này?")) return;
    setError("");
    setMessage("");
    try {
      await softDeleteSize(id);
      setMessage("Xóa size thành công!");
      fetchSizes();
    } catch (err) {
      setError("Xóa size thất bại!");
    }
  };

  const filteredSizes = sizes.filter((size) => (showDeleted ? size.is_deleted : !size.is_deleted));

  return (
    <div className="w-full">
      <div className="flex items-center mb-4 gap-2">
        <button
          className={`option-btn ${!showDeleted ? "active" : ""}`}
          onClick={() => setShowDeleted(false)}
        >
          Size chưa bị xóa
        </button>
        <button
          className={`option-btn ${showDeleted ? "active" : ""}`}
          onClick={() => setShowDeleted(true)}
        >
          Size đã xóa
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ml-auto"
          onClick={() => navigate("/sizes/add")}
        >
          Thêm size
        </button>
      </div>
      {message && <div className="form-success mb-2">{message}</div>}
      {error && <div className="form-error mb-2">{error}</div>}
      <div className="size-table-scroll">
        <table className="min-w-max w-full bg-white rounded-lg shadow border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b">#</th>
              <th className="px-4 py-2 border-b">Tên size</th>
              <th className="px-4 py-2 border-b">Mã size</th>
              <th className="px-4 py-2 border-b">Trạng thái</th>
              <th className="px-4 py-2 border-b">Đã xóa?</th>
              <th className="px-4 py-2 border-b">Ngày tạo</th>
              <th className="px-4 py-2 border-b">Ngày cập nhật</th>
              {!showDeleted && <th className="px-4 py-2 border-b">Hành động</th>}
            </tr>
          </thead>
          <tbody>
            {filteredSizes.map((size, index) => (
              <tr key={size._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{index + 1}</td>
                <td className="px-4 py-2 border-b">{size.name}</td>
                <td className="px-4 py-2 border-b">{size.code || "--"}</td>
                <td className="px-4 py-2 border-b">
                  <span className={`status-badge ${size.status}`}>{size.status}</span>
                </td>
                <td className="px-4 py-2 border-b">
                  {size.is_deleted ? (
                    <span className="deleted-badge">Đã xóa</span>
                  ) : (
                    <span className="not-deleted-badge">Chưa xóa</span>
                  )}
                </td>
                <td className="px-4 py-2 border-b">
                  {size.createdAt ? new Date(size.createdAt).toLocaleString() : ""}
                </td>
                <td className="px-4 py-2 border-b">
                  {size.updatedAt ? new Date(size.updatedAt).toLocaleString() : ""}
                </td>
                {!showDeleted && (
                  <td className="px-4 py-2 border-b">
                    <button
                      className="action-btn edit mr-2"
                      onClick={() => navigate(`/sizes/update/${size._id}`)}
                    >
                      Sửa
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(size._id)}
                    >
                      Xóa
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filteredSizes.length === 0 && (
              <tr>
                <td colSpan={showDeleted ? 8 : 9} className="text-center py-4 text-gray-400">
                  {loading ? "Đang tải..." : "Không có dữ liệu"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListSizes;
