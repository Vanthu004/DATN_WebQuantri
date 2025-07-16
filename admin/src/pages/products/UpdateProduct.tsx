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
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    status: "active" as "active" | "inactive" | "out_of_stock",
    image_url: "",
    category_id: "",
    images: [] as string[], // mảng id ảnh upload
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Quản lý mảng file ảnh upload mới và preview
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Khi load sản phẩm, lấy dữ liệu và ảnh hiện có (images) nếu có
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
          images: data.images?.map((img) => typeof img === "string" ? img : img._id) || [],
        });

        // Nếu có images thì lấy url để preview (giả sử img có trường url)
        if (data.images && data.images.length > 0) {
          const urls = data.images.map((img) => (typeof img === "string" ? "" : img.url));
          setImagePreviews(urls);
        } else if (data.image_url) {
          setImagePreviews([data.image_url]);
        } else {
          setImagePreviews([]);
        }

        // reset imageFiles mới upload
        setImageFiles([]);
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

  // Chọn nhiều file ảnh, thêm vào mảng file hiện có, tạo preview tương ứng
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      // Xóa field nhập link ảnh khi chọn file
      setForm((prev) => ({ ...prev, image_url: "" }));
    }
  };

  // Xoá ảnh theo index (cả file upload và preview)
  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => {
      // Nếu ảnh đó thuộc images cũ (chưa upload), xoá khỏi mảng images
      if (index < prev.images.length) {
        const newImages = [...prev.images];
        newImages.splice(index, 1);
        return { ...prev, images: newImages };
      }
      return prev;
    });
  };

  // Nhập link ảnh, xoá toàn bộ ảnh file upload và preview
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, image_url: e.target.value, images: [] }));
    setImageFiles([]);
    setImagePreviews(e.target.value ? [e.target.value] : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      let uploadedImages: { _id: string; url: string }[] = [];

      // Nếu có file ảnh mới, upload tất cả
      if (imageFiles.length > 0) {
        const uploadResList = await Promise.all(imageFiles.map(file => uploadImage(file)));
        uploadedImages = uploadResList;
      }

      // Kết hợp images cũ (chưa xoá) và images mới upload
      const newImageIds = uploadedImages.map(img => img._id);
      const finalImageIds = [...form.images, ...newImageIds];

      // Lấy url ảnh chính (ảnh đầu tiên của uploaded hoặc nếu không thì image_url nhập tay hoặc ảnh đầu tiên của images cũ)
      let mainImageUrl = form.image_url;
      if (uploadedImages.length > 0) {
        mainImageUrl = uploadedImages[0].url;
      } else if (form.images.length > 0 && imagePreviews.length > 0) {
        mainImageUrl = imagePreviews[0];
      }

      await updateProduct(id, {
        ...form,
        images: finalImageIds,
        image_url: mainImageUrl,
      });

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
          <label>Danh mục</label>
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
