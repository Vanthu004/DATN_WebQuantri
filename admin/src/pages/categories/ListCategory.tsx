import { useEffect, useState } from "react";
import Category from "../../interfaces/category";
import { deleteCategory, getAllCategories } from "../../services/category";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ListCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchAllCategory();
  }, []);

  const fetchAllCategory = async () => {
    try {
      const data = await getAllCategories();
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
      <div className="overflow-x-auto">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
          onClick={() => navigate("/categories/add")}
        >
          Thêm danh mục
        </button>
        <table className="min-w-[1200px] bg-white rounded-lg shadow border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b">#</th>
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category: Category, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{index + 1}</td>
                <td className="px-4 py-2 border-b">{category.name}</td>
                <td className="px-4 py-2 border-b">
                  <button
                    className=""
                    onClick={() =>
                      navigate(`/categories/update/${category._id}`)
                    }
                  >
                    Sửa
                  </button>
                  |
                  <button
                    className=""
                    onClick={() => handleDeleteCategory(category._id)}
                  >
                    Xóa
                  </button>
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
