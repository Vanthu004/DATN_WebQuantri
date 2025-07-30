import { useState, useEffect } from "react";
import { createProduct } from "../../services/product";
import { getAllCategories } from "../../services/category";
import Category from "../../interfaces/category";
import "../../css/products/addProduct.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadImage } from "../../services/upload";
import { getAllSizes } from "../../services/size";
import { getAllColors } from "../../services/color";
import { Size } from "../../interfaces/size";
import { Color } from "../../interfaces/color";

interface VariantForm {
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
  sku: string;
  image_url: string;
}

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

  // State cho biến thể
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [variantForm, setVariantForm] = useState({
    size: "",
    color: "",
    price: 0,
    stock_quantity: 0,
    sku: "",
    image_url: ""
  });
  const [variantImageFile, setVariantImageFile] = useState<File | null>(null);
  const [variantImagePreview, setVariantImagePreview] = useState<string>("");

  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);

  useEffect(() => {
    getAllCategories().then((data) => {
      if (Array.isArray(data)) setCategories(data);
      else setCategories([]);
    });
    getAllSizes().then((data) => {
      if (Array.isArray(data)) setSizes(data);
      else setSizes([]);
    });
    getAllColors().then((data) => {
      if (Array.isArray(data)) setColors(data);
      else setColors([]);
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

  // Xử lý biến thể
  const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVariantForm((prev) => ({ ...prev, [name]: name === "price" || name === "stock_quantity" ? Number(value) : value }));
  };

  const handleVariantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVariantImageFile(file);
      setVariantImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!variantForm.size || !variantForm.color || !variantForm.sku) {
      toast.error("Vui lòng điền đầy đủ thông tin biến thể!");
      return;
    }

    // Check if variant already exists
    const existingVariant = variants.find(
      v => v.size === variantForm.size && v.color === variantForm.color
    );
    if (existingVariant) {
      toast.error("Biến thể này đã tồn tại!");
      return;
    }

    let imageUrl = variantForm.image_url;
    if (variantImageFile) {
      try {
        const uploadRes = await uploadImage(variantImageFile);
        imageUrl = uploadRes.url;
      } catch (error) {
        toast.error("Lỗi upload ảnh biến thể!");
        return;
      }
    }

    setVariants((prev) => [
      ...prev,
      {
        ...variantForm,
        image_url: imageUrl,
        size: variantForm.size,
        color: variantForm.color
      }
    ]);
    
    // Reset form
    setVariantForm({ size: "", color: "", price: 0, stock_quantity: 0, sku: "", image_url: "" });
    setVariantImageFile(null);
    setVariantImagePreview("");
    setShowVariantForm(false);
    
    toast.success("Thêm biến thể thành công!");
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Đã xóa biến thể!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      let mainImageUrl = form.image_url;
      const uploadedImages: { _id: string; url: string }[] = [];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const uploadRes = await uploadImage(file); // { _id, url }
          uploadedImages.push(uploadRes);
        }
        mainImageUrl = uploadedImages[0].url;
      }

      const imageIds = uploadedImages.map((img) => img._id);

      // Gửi sản phẩm kèm biến thể trong 1 lần gọi
      const result = await createProduct({
        ...form,
        image_url: mainImageUrl,
        images: imageIds,
        variants: variants.map((v) => ({
          sku: v.sku,
          price: v.price,
          stock_quantity: v.stock_quantity,
          attributes: {
            size: v.size,
            color: v.color
          },
          image_url: v.image_url
        }))
      });

      if (result) {
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
        setVariants([]);

        toast.success("Thêm sản phẩm thành công!");
        navigate("/products");
      }
    } catch (err) {
      console.error("Error creating product:", err);
      setError("Có lỗi xảy ra khi thêm sản phẩm.");
      toast.error("Thêm sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const getSizeName = (sizeId: string) => {
    return sizes.find(s => s._id === sizeId)?.name || sizeId;
  };

  const getColorName = (colorId: string) => {
    return colors.find(c => c._id === colorId)?.name || colorId;
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
          <label>Giá cơ bản:</label>
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
          <label>Số lượng kho cơ bản:</label>
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

        <div>
          <label>Biến thể sản phẩm:</label>
          <button
            type="button"
            className="add-variant-btn"
            onClick={() => setShowVariantForm((v) => !v)}
          >
            {showVariantForm ? "Đóng" : "Thêm biến thể"}
          </button>
          {variants.length > 0 && (
            <span className="variant-count">({variants.length} biến thể đã thêm)</span>
          )}
        </div>
        
        {showVariantForm && (
          <div className="variant-form-section">
            <div className="variant-form">
              <div>
                <label>Size:</label>
                <select name="size" value={variantForm.size} onChange={handleVariantChange} required>
                  <option value="">-- Chọn size --</option>
                  {sizes.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Màu sắc:</label>
                <select name="color" value={variantForm.color} onChange={handleVariantChange} required>
                  <option value="">-- Chọn màu --</option>
                  {colors.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Giá:</label>
                <input type="number" name="price" value={variantForm.price} onChange={handleVariantChange} min={0} required />
              </div>
              <div>
                <label>Số lượng kho:</label>
                <input type="number" name="stock_quantity" value={variantForm.stock_quantity} onChange={handleVariantChange} min={0} required />
              </div>
              <div>
                <label>SKU:</label>
                <input type="text" name="sku" value={variantForm.sku} onChange={handleVariantChange} required />
              </div>
              <div>
                <label>Ảnh biến thể:</label>
                <input type="file" accept="image/*" onChange={handleVariantImageChange} />
                {variantImagePreview && (
                  <div className="image-preview-container">
                    <img src={variantImagePreview} alt="Preview" />
                  </div>
                )}
                <span>Hoặc nhập link ảnh:</span>
                <input 
                  type="text" 
                  name="image_url" 
                  value={variantForm.image_url} 
                  onChange={handleVariantChange}
                  placeholder="Link ảnh biến thể"
                  disabled={!!variantImageFile}
                />
              </div>
              <button type="button" className="add-variant-btn" onClick={handleAddVariant}>
                Thêm vào danh sách biến thể
              </button>
            </div>
          </div>
        )}
        
        {variants.length > 0 && (
          <div className="variant-list-section">
            <h4>Danh sách biến thể đã thêm:</h4>
            <table className="variant-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Màu</th>
                  <th>Giá</th>
                  <th>Kho</th>
                  <th>SKU</th>
                  <th>Ảnh</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, idx) => (
                  <tr key={idx}>
                    <td>{getSizeName(v.size)}</td>
                    <td>{getColorName(v.color)}</td>
                    <td>{v.price?.toLocaleString() || "0"}</td>
                    <td>{v.stock_quantity || "0"}</td>
                    <td>{v.sku}</td>
                    <td>
                      {v.image_url ? (
                        <img src={v.image_url} alt="variant" style={{ width: 40, height: 40, objectFit: "cover" }} />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </td>
                    <td>
                      <button type="button" className="delete-image-btn" onClick={() => handleRemoveVariant(idx)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Đang thêm..." : "Thêm sản phẩm"}
        </button>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default AddProduct;
