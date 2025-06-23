import { createCategory } from "../../services/category";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import "../../css/categoryCss/addCategory.css";
import { useNavigate } from "react-router-dom";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [image_url, setImageUrl] = useState("");
  const [sort_order, setSortOrder] = useState(0);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({
        name,
        status,
        image_url: image_url || undefined,
        sort_order,
        is_deleted: false,
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
            required
          />
        </div>
        <div>
          <label>Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label>Ảnh (URL)</label>
          <input
            type="text"
            value={image_url}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <label>Thứ tự hiển thị (sort_order)</label>
          <input
            type="number"
            value={sort_order}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            min={0}
          />
        </div>
        <button type="submit">Xác nhận</button>
      </form>
    </div>
  );
};

export default AddCategory;
