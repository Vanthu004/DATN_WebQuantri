import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategoryById, updateCategory } from "../../services/category";
import { getAllCategoryTypes } from "../../services/categoryType";
import { uploadImage } from "../../services/upload";
import { toast } from "react-toastify";
import Category from "../../interfaces/category";
import CategoryType from "../../interfaces/categoryType";
import "../../css/categoryCss/updateCategory.css";

const UpdateCategory = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [image_url, setImageUrl] = useState("");
  const [sort_order, setSortOrder] = useState(0);
  const [type, setType] = useState<string>("");
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const navigate = useNavigate();

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

  useEffect(() => {
    if (!id) return;
    const fetchCategory = async () => {
      try {
        const response = (await getCategoryById(id)) as Category;
        setName(response.name);
        setStatus(response.status);
        setImageUrl(response.image_url || "");
        setSortOrder(response.sort_order);
        setType(response.type || "");
        setImagePreview(response.image_url || "");
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategory();
  }, [id]);

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
    if (!id) return;
    if (!name.trim()) {
      toast.error("Tên danh mục không được để trống!");
      return;
    }
    if (!type) {
      toast.error("Vui lòng chọn loại danh mục!");
      return;
    }
    try {
      await updateCategory(id, { name, status, image_url, sort_order, type });
      toast.success("Cập nhật thành công!");
      navigate("/categories");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="update-category-container">
      <h3>Cập nhật danh mục</h3>
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
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImagePreview(e.target.value);
            }}
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
          <label>Loại danh mục</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">-- Chọn loại danh mục --</option>
            {categoryTypes.map((catType) => (
              <option key={catType._id} value={catType.code}>
                {catType.name}
              </option>
            ))}
          </select>
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
        <div className="update-category-btn-group">
          <button type="submit" className="submit-btn">
            Xác nhận
          </button>
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/categories")}
          >
            Quay lại
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateCategory;
