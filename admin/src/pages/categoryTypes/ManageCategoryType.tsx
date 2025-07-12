import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryType from "../../interfaces/categoryType";
import {
  getAllCategoryTypes,
  createCategoryType,
  updateCategoryType,
  deleteCategoryType,
} from "../../services/categoryType";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaEye, FaTimes, FaSave } from "react-icons/fa";

const ManageCategoryType = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState<CategoryType[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const data = await getAllCategoryTypes();
      setTypes(data);
    } catch (e) {
      toast.error("Lỗi tải loại danh mục");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Tên và mã loại danh mục không được để trống");
      return;
    }
    try {
      if (editingId) {
        await updateCategoryType(editingId, { name, code, description });
        toast.success("Cập nhật thành công");
      } else {
        await createCategoryType({ name, code, description });
        toast.success("Thêm thành công");
      }
      setName("");
      setCode("");
      setDescription("");
      setEditingId(null);
      fetchTypes();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Lỗi thao tác");
    }
  };

  const handleEdit = (type: CategoryType) => {
    setEditingId(type._id);
    setName(type.name);
    setCode(type.code);
    setDescription(type.description || "");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xác nhận xóa loại danh mục này?")) return;
    try {
      await deleteCategoryType(id);
      toast.success("Đã xóa");
      fetchTypes();
    } catch (e) {
      toast.error("Lỗi xóa loại danh mục");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setDescription("");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Quản lý loại danh mục
        </h1>
        <p className="text-gray-600">
          Tạo và quản lý các loại danh mục để phân loại sản phẩm
        </p>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaPlus className="mr-2 text-blue-600" />
          {editingId ? "Cập nhật loại danh mục" : "Thêm loại danh mục mới"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên loại danh mục *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Sản phẩm nổi bật"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã loại (code) *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ví dụ: hot, best_seller"
                required
                disabled={!!editingId}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  editingId ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              {editingId && (
                <p className="text-xs text-gray-500 mt-1">
                  Không thể thay đổi mã loại khi đang chỉnh sửa
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết về loại danh mục này..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              {editingId ? (
                <>
                  <FaSave className="mr-2" />
                  Cập nhật
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" />
                  Thêm mới
                </>
              )}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
              >
                <FaTimes className="mr-2" />
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Danh sách loại danh mục ({types.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        ) : types.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Chưa có loại danh mục nào
            </h3>
            <p className="text-gray-500">
              Hãy tạo loại danh mục đầu tiên để bắt đầu
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {types.map((type) => (
                  <tr key={type._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {type.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {type.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {type.description || "Không có mô tả"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(type)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-200"
                        >
                          <FaEdit className="mr-1" />
                          Sửa
                        </button>
                        
                        <button
                          onClick={() => navigate(`/products/category-type/${type._id}`)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                        >
                          <FaEye className="mr-1" />
                          Xem sản phẩm
                        </button>
                        
                        <button
                          onClick={() => handleDelete(type._id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
                        >
                          <FaTrash className="mr-1" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategoryType; 