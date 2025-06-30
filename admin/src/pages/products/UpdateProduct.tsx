import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../../services/product";
import { getAllCategories } from "../../services/category";
import { uploadImage } from "../../services/upload";
import Category from "../../interfaces/category";
import Product from "../../interfaces/product";
import { toast } from "react-toastify";
import "../../css/products/updateProduct.css";

const UpdateProduct = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    status: "active" as "active" | "inactive" | "out_of_stock",
    image_url: "",
    category_id: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const data = (await getProductById(id)) as Product;
        setForm({
          name: data.name || "",
          description: data.description || "",
          price: data.price || 0,
          stock_quantity: data.stock_quantity || 0,
          status: data.status || "active",
          image_url: data.image_url || "",
          category_id:
            typeof data.category_id === "object"
              ? data.category_id._id
              : data.category_id || "",
        });
        setImagePreview(data.image_url || "");
      } catch (err) {
        setError("Không tìm thấy sản phẩm");
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    getAllCategories().then((data) => {
      if (Array.isArray(data)) setCategories(data);
      else setCategories([]);
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock_quantity" ? Number(value) : value,
    }));
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      try {
        const res = (await uploadImage(file)) as { url: string };
        setForm((prev) => ({ ...prev, image_url: res.url }));
      } catch (err) {
        toast.error("Upload ảnh thất bại!");
      }
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, image_url: e.target.value }));
    setImageFile(null);
    setImagePreview(e.target.value);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setForm((prev) => ({ ...prev, image_url: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      await updateProduct(id, form);
      toast.success("Cập nhật sản phẩm thành công!");
      navigate("/products");
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h3>Cập nhật sản phẩm</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên sản phẩm</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            type="text"
          />
        </div>
        <div>
          <label>Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Giá</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min={0}
          />
        </div>
        <div>
          <label>Số lượng kho</label>
          <input
            type="number"
            name="stock_quantity"
            value={form.stock_quantity}
            onChange={handleChange}
            required
            min={0}
          />
        </div>
        <div>
          <label>Trạng thái</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>
        </div>
        <div className="image-upload-section">
          <label>Ảnh sản phẩm:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
          />
          <span>Hoặc nhập link ảnh:</span>
          <input
            name="image_url"
            type="text"
            value={form.image_url}
            onChange={handleImageUrlChange}
            placeholder="Dán link ảnh nếu có"
            disabled={!!imageFile}
          />
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="delete-image-btn"
              >
                Xóa ảnh
              </button>
            </div>
          )}
        </div>
        <div>
          <label>Danh mục</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
          >
            <option value={form.category_id}>
              {categories.find((cat) => cat._id === form.category_id)?.name ||
                "-- Chọn danh mục --"}
            </option>
            {categories
              .filter((cat) => cat._id !== form.category_id)
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>
        <div className="form-btn-group">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
          </button>
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/products")}
          >
            Quay lại
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default UpdateProduct;
