import { createCategory } from "../../services/category";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import "../../css/categoryCss/addCategory.css";
import { useNavigate } from "react-router-dom";

const AddCategory = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({
        name,
      });
      toast("Thêm danh mục thành công");
      navigate("/categories");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="add-category-container">
      <h3>Thêm danh mục</h3>
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

export default AddCategory;
