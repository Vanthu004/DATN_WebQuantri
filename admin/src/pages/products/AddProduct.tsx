import { useState, useEffect } from "react";
import { createProduct } from "../../services/product";
import { getAllCategories } from "../../services/category";
import Category from "../../interfaces/category";
import "../../css/products/addProduct.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadImage } from "../../services/upload";

const AddProduct = () => {
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

  // Lưu mảng file ảnh và preview ảnh
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

  // Chọn nhiều ảnh, thêm ảnh mới vào mảng ảnh cũ
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);

      // Xóa input image_url khi chọn file
      setForm((prev) => ({ ...prev, image_url: "" }));
    }
  };

  // Xóa ảnh theo index
  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Nhập link ảnh (xóa ảnh file đang chọn)
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, image_url: e.target.value }));
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let mainImageUrl = form.image_url;
      let uploadedImages: { _id: string; url: string }[] = [];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const uploadRes = await uploadImage(file); // { _id, url }
          uploadedImages.push(uploadRes);
        }
        mainImageUrl = uploadedImages[0].url;
      }

      const imageIds = uploadedImages.map((img) => img._id);

      await createProduct({
        ...form,
        image_url: mainImageUrl,
        images: imageIds,
      });

      setForm({
        name: "",
        description: "",
        price: 0,
        stock_quantity: 0,
        status: "active",
        image_url: "",
        category_id: "",
      });
      setImageFiles([]);
      setImagePreviews([]);

      toast.success("Thêm sản phẩm thành công!");
      navigate("/products");
    } catch (err) {
      setError("Có lỗi xảy ra khi thêm sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Thêm sản phẩm</h2>
      <form onSubmit={handleSubmit} className="add-product-form">
        <div>
          <label>Tên sản phẩm:</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Mô tả:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Giá:</label>
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
          <label>Số lượng kho:</label>
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
          <label>Trạng thái:</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>
        </div>

        <div className="image-upload-section">
          <label>Ảnh sản phẩm (có thể chọn nhiều):</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageFileChange}
          />
          {imagePreviews.length > 0 && (
            <div className="image-preview-list">
              {imagePreviews.map((src, index) => (
                <div key={index} className="image-preview-container">
                  <img src={src} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="delete-image-btn"
                  >
                    Xóa ảnh
                  </button>
                </div>
              ))}
            </div>
          )}
          <span>Hoặc nhập link ảnh:</span>
          <input
            name="image_url"
            type="text"
            value={form.image_url}
            onChange={handleImageUrlChange}
            placeholder="Dán link ảnh nếu có"
            disabled={imageFiles.length > 0}
          />
        </div>

        <div>
          <label>Danh mục:</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Đang thêm..." : "Thêm sản phẩm"}
        </button>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default AddProduct;
