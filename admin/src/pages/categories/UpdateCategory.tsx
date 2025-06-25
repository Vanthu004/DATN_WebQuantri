import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategoryById, updateCategory } from "../../services/category";
import { toast } from "react-toastify";
import Category from "../../interfaces/category";

const UpdateCategory = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (!id) return;
    const fetchCategory = async () => {
      try {
        const response = (await getCategoryById(id)) as Category;
        setName(response.name);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateCategory(id, { name });
      toast.success("Cập nhật thành công!");
      navigate("/categories");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="add-category-container">
      <h3>Cập nhật danh mục</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên danh mục</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit">Xác nhận</button>
      </form>
    </div>
  );
};

export default UpdateCategory;
