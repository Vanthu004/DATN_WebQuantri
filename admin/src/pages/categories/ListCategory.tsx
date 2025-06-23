import { useEffect, useState } from "react";
import Category from "../../interfaces/category";
import { deleteCategory, getAllCategories } from "../../services/category";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ListCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchAllCategory();
    // eslint-disable-next-line
  }, [showDeleted]);

  const fetchAllCategory = async () => {
    try {
      const data = await getAllCategories(showDeleted);
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success("Xóa thành công !");
      fetchAllCategory();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4 gap-2">
        <button
          className={`option-btn ${!showDeleted ? "active" : ""}`}
          onClick={() => setShowDeleted(false)}
        >
          Danh mục chưa bị xóa
        </button>
        <button
          className={`option-btn ${showDeleted ? "active" : ""}`}
          onClick={() => setShowDeleted(true)}
        >
          Danh mục đã xóa
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ml-auto"
          onClick={() => navigate("/categories/add")}
        >
          Thêm danh mục
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] bg-white rounded-lg shadow border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b">#</th>
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">Status</th>
              <th className="px-4 py-2 border-b">Image</th>
              <th className="px-4 py-2 border-b">Sort Order</th>
              <th className="px-4 py-2 border-b">Đã xóa?</th>
              <th className="px-4 py-2 border-b">Created At</th>
              <th className="px-4 py-2 border-b">Updated At</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category: Category, index: number) => (
              <tr key={category._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{index + 1}</td>
                <td className="px-4 py-2 border-b">{category.name}</td>
                <td className="px-4 py-2 border-b">
                  <span className={`status-badge ${category.status}`}>
                    {category.status}
                  </span>
                </td>
                <td className="px-4 py-2 border-b">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 italic">No image</span>
                  )}
                </td>
                <td className="px-4 py-2 border-b">{category.sort_order}</td>
                <td className="px-4 py-2 border-b">
                  {category.is_deleted ? (
                    <span className="deleted-badge">Đã xóa</span>
                  ) : (
                    <span className="not-deleted-badge">Chưa xóa</span>
                  )}
                </td>
                <td className="px-4 py-2 border-b">
                  {new Date(category.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 border-b">
                  {new Date(category.updatedAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    className="action-btn edit"
                    onClick={() =>
                      navigate(`/categories/update/${category._id}`)
                    }
                    disabled={category.is_deleted}
                  >
                    Sửa
                  </button>
                  {!category.is_deleted && (
                    <>
                      {" | "}
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListCategory;
