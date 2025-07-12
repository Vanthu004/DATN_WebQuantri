import { createCategory } from "../../services/category";
import { uploadImage } from "../../services/upload";
<<<<<<< HEAD
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import "../../css/categoryCss/addCategory.css";
import { useNavigate } from "react-router-dom";
=======
import { getAllCategoryTypes } from "../../services/categoryType";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import "../../css/categoryCss/addCategory.css";
import { useNavigate } from "react-router-dom";
import CategoryType from "../../interfaces/categoryType";
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08

const AddCategory = () => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [image_url, setImageUrl] = useState("");
  const [sort_order, setSortOrder] = useState(0);
<<<<<<< HEAD
=======
  const [categoryType, setCategoryType] = useState<string>("");
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const navigate = useNavigate();

<<<<<<< HEAD
=======
  useEffect(() => {
    const fetchCategoryTypes = async () => {
      try {
        const types = await getAllCategoryTypes();
        setCategoryTypes(types);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategoryTypes();
  }, []);

>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      try {
        const res = (await uploadImage(file)) as { url: string };
        setImageUrl(res.url);
      } catch (err) {
        toast.error("Upload ảnh thất bại!");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
=======
    if (!name.trim()) {
      toast.error("Tên danh mục không được để trống!");
      return;
    }
    if (!categoryType) {
      toast.error("Vui lòng chọn loại danh mục!");
      return;
    }
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
    try {
      await createCategory({
        name,
        status,
        image_url: image_url || undefined,
        sort_order,
<<<<<<< HEAD
        is_deleted: false,
      });
      toast("Thêm danh mục thành công");
=======
        categoryType,
        is_deleted: false,
      });
      toast.success("Thêm danh mục thành công");
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
      navigate("/categories");
    } catch (error) {
      toast.error("Thêm danh mục thất bại!");
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
          <label>Ảnh (upload file hoặc dán link)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
          />
          <span>Hoặc nhập link ảnh:</span>
          <input
            type="text"
            value={image_url}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            disabled={!!imageFile}
          />
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="delete-image-btn"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview("");
                  setImageUrl("");
                }}
              >
                Xóa ảnh
              </button>
            </div>
          )}
        </div>
        <div>
<<<<<<< HEAD
=======
          <label>Loại danh mục</label>
          <select
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value)}
            required
          >
            <option value="">-- Chọn loại danh mục --</option>
            {categoryTypes.map((catType) => (
              <option key={catType._id} value={catType._id}>
                {catType.name}
              </option>
            ))}
          </select>
        </div>
        <div>
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
          <label>Thứ tự hiển thị (sort_order)</label>
          <input
            type="number"
            value={sort_order}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            min={0}
          />
        </div>
        <button type="submit" className="submit-btn">
          Xác nhận
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
