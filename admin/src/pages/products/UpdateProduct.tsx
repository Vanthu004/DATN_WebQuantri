import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct, deleteVariant, createVariant, Variant } from "../../services/product";
import { getAllCategories } from "../../services/category";
import { uploadImage } from "../../services/upload";
import { getAllSizes } from "../../services/size";
import { getAllColors } from "../../services/color";
import Category from "../../interfaces/category";
import { toast } from "react-toastify";
import "../../css/products/updateProduct.css";
import { Size } from "../../interfaces/size";
import { Color } from "../../interfaces/color";

interface VariantForm {
  _id?: string;
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
  sku: string;
  image_url: string;
}

function isSizeObject(val: unknown): val is Size {
  return typeof val === "object" && val !== null && "_id" in val && "name" in val;
}
function isColorObject(val: unknown): val is Color {
  return typeof val === "object" && val !== null && "_id" in val && "name" in val;
}

// Thêm interface cho form size detail
interface SizeDetailForm {
  size: string;
  price: number;
  stock_quantity: number;
  sku: string;
  image_url: string;
}

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

  // Biến thể
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [variantForm, setVariantForm] = useState<VariantForm>({
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

  // Thêm state mới để chọn màu trước và chọn nhiều size cho màu đó
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Thêm state cho form chi tiết từng size
  const [sizeDetails, setSizeDetails] = useState<SizeDetailForm[]>([]);

  // Thêm state cho validation errors
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Thêm state cho ảnh màu sắc
  const [colorImageFile, setColorImageFile] = useState<File | null>(null);
  const [colorImagePreview, setColorImagePreview] = useState<string>("");
  const [colorImageUrl, setColorImageUrl] = useState<string>("");

  // Khi load sản phẩm, lấy dữ liệu và ảnh hiện có (images) nếu có
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id, true); // Include variants
        if (!data) throw new Error();
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
        setImageFiles([]);
        // Lấy variants từ product nếu có
        setVariants(Array.isArray(data.variants) ? data.variants : []);
      } catch (err) {
        setError("Không tìm thấy sản phẩm");
        toast.error("Không thể tải thông tin sản phẩm!");
      }
    };
    fetchProduct();
    // Fetch size, color
    getAllSizes().then((data: Size[]) => setSizes(Array.isArray(data) ? data : []));
    getAllColors().then((data: Color[]) => setColors(Array.isArray(data) ? data : []));
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

  // Biến thể
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
    if (!id) return;
    
    // Validate required fields
    if (!variantForm.size || !variantForm.color || !variantForm.sku) {
      toast.error("Vui lòng điền đầy đủ thông tin biến thể!");
      return;
    }

    // Check if variant already exists
    const existingVariant = variants.find(
      v => {
        const sizeId = typeof v.attributes.size === "object" ? v.attributes.size._id : v.attributes.size;
        const colorId = typeof v.attributes.color === "object" ? v.attributes.color._id : v.attributes.color;
        return sizeId === variantForm.size && colorId === variantForm.color;
      }
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
    
    // Tạo mới biến thể
    const payload = {
      product_id: id,
      sku: variantForm.sku,
      price: variantForm.price,
      stock_quantity: variantForm.stock_quantity,
      attributes: {
        size: variantForm.size,
        color: variantForm.color
      },
      image_url: imageUrl
    };
    
    try {
      await createVariant([payload]);
      // Sau khi thêm biến thể, reload lại variants bằng getProductById
      const data = await getProductById(id, true);
      setVariants(Array.isArray(data?.variants) ? data.variants : []);
      setVariantForm({ size: "", color: "", price: 0, stock_quantity: 0, sku: "", image_url: "" });
      setVariantImageFile(null);
      setVariantImagePreview("");
      setShowVariantForm(false);
      toast.success("Thêm biến thể thành công!");
    } catch (error) {
      toast.error("Thêm biến thể thất bại!");
    }
  };
  
  const handleRemoveVariant = async (variantId: string) => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa biến thể này?")) return;
    
    try {
      await deleteVariant(variantId);
      // Sau khi xóa biến thể, reload lại variants bằng getProductById
      const data = await getProductById(id, true);
      setVariants(Array.isArray(data?.variants) ? data.variants : []);
      toast.success("Xóa biến thể thành công!");
    } catch (error) {
      toast.error("Xóa biến thể thất bại!");
    }
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
      toast.error("Cập nhật sản phẩm thất bại!");
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

  const getVariantSizeName = (variant: Variant) => {
    if (variant.size_name) return variant.size_name;
    if (isSizeObject(variant.attributes.size)) return variant.attributes.size.name;
    if (typeof variant.attributes.size === "string") return getSizeName(variant.attributes.size);
    return "";
  };

  const getVariantColorName = (variant: Variant) => {
    if (variant.color_name) return variant.color_name;
    if (isColorObject(variant.attributes.color)) return variant.attributes.color.name;
    if (typeof variant.attributes.color === "string") return getColorName(variant.attributes.color);
    return "";
  };

  // Xử lý upload ảnh cho màu sắc
  const handleColorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setColorImageFile(file);
      setColorImagePreview(URL.createObjectURL(file));
      setColorImageUrl(""); // Reset URL khi chọn file
    }
  };

  // Xử lý nhập URL ảnh cho màu sắc
  const handleColorImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorImageUrl(e.target.value);
    setColorImageFile(null);
    setColorImagePreview("");
  };

  // Khi chọn màu, reset selectedSizes và sizeDetails
  const handleColorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColor(e.target.value);
    setSelectedSizes([]);
    setSizeDetails([]);
    // Reset ảnh màu khi chọn màu mới
    setColorImageFile(null);
    setColorImagePreview("");
    setColorImageUrl("");
  };

  // Khi chọn/bỏ chọn size
  const handleSizeToggle = (sizeId: string) => {
    setSelectedSizes((prev) => {
      const newSelectedSizes = prev.includes(sizeId) 
        ? prev.filter((id) => id !== sizeId) 
        : [...prev, sizeId];
      
      // Cập nhật sizeDetails tương ứng - sử dụng Set để tránh trùng lặp
      setSizeDetails((prevDetails) => {
        if (prev.includes(sizeId)) {
          // Bỏ chọn size
          return prevDetails.filter(detail => detail.size !== sizeId);
        } else {
          // Chọn thêm size - kiểm tra không trùng lặp
          const existingSize = prevDetails.find(detail => detail.size === sizeId);
          if (existingSize) {
            return prevDetails; // Không thêm nếu đã tồn tại
          }
          return [...prevDetails, {
            size: sizeId,
            price: 0,
            stock_quantity: 0,
            sku: "",
            image_url: ""
          }];
        }
      });
      
      return newSelectedSizes;
    });
  };

  // Xóa size khỏi danh sách đã chọn
  const handleRemoveSize = (sizeId: string) => {
    setSelectedSizes((prev) => prev.filter(id => id !== sizeId));
    setSizeDetails((prev) => prev.filter(detail => detail.size !== sizeId));
  };

  // Tự động sinh SKU
  const generateSKU = (sizeId: string) => {
    const sizeName = sizes.find(s => s._id === sizeId)?.name || sizeId;
    const colorName = colors.find(c => c._id === selectedColor)?.name || selectedColor;
    const productCode = form.name.substring(0, 3).toUpperCase() || "PRO";
    const colorCode = colorName.substring(0, 2).toUpperCase() || "CL";
    
    return `${productCode}-${colorCode}-${sizeName}`;
  };

  // Cập nhật thông tin chi tiết của size
  const handleSizeDetailChange = (sizeId: string, field: keyof SizeDetailForm, value: string | number) => {
    setSizeDetails((prev) =>
      prev.map(detail =>
        detail.size === sizeId
          ? { ...detail, [field]: value }
          : detail
      )
    );
    
    // Clear validation error khi user nhập
    if (validationErrors[`${sizeId}-${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${sizeId}-${field}`];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateSizeDetails = () => {
    const errors: {[key: string]: string} = {};
    
    sizeDetails.forEach(detail => {
      if (detail.price <= 0) {
        errors[`${detail.size}-price`] = "Giá phải lớn hơn 0";
      }
      if (detail.stock_quantity < 0) {
        errors[`${detail.size}-stock_quantity`] = "Số lượng kho không được âm";
      }
      if (!detail.sku.trim()) {
        errors[`${detail.size}-sku`] = "SKU không được để trống";
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Thêm nhiều biến thể cùng màu với các size đã chọn
  const handleAddVariantsByColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!selectedColor || selectedSizes.length === 0) {
      toast.error("Vui lòng chọn màu và ít nhất một size!");
      return;
    }
    
    // Kiểm tra trùng lặp
    const duplicates = selectedSizes.filter(sizeId =>
      variants.some(v => {
        const colorId = typeof v.attributes.color === "object" ? v.attributes.color._id : v.attributes.color;
        const sizeId = typeof v.attributes.size === "object" ? v.attributes.size._id : v.attributes.size;
        return colorId === selectedColor && sizeId === sizeId;
      })
    );
    if (duplicates.length > 0) {
      toast.error("Một số biến thể đã tồn tại!");
      return;
    }
    
    // Validate form
    if (!validateSizeDetails()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }
    
    // Upload ảnh màu sắc nếu có
    let finalColorImageUrl = colorImageUrl;
    if (colorImageFile) {
      try {
        const uploadRes = await uploadImage(colorImageFile);
        finalColorImageUrl = uploadRes.url;
      } catch (error) {
        toast.error("Lỗi upload ảnh màu sắc!");
        return;
      }
    }
    
    // Tạo payload cho từng biến thể
    const payloads = sizeDetails.map(detail => ({
      product_id: id,
      sku: detail.sku,
      price: detail.price,
      stock_quantity: detail.stock_quantity,
      attributes: {
        size: detail.size,
        color: selectedColor
      },
      image_url: detail.image_url || finalColorImageUrl
    }));
    
    try {
      await createVariant(payloads);
      // Sau khi thêm biến thể, reload lại variants bằng getProductById
      const data = await getProductById(id, true);
      setVariants(Array.isArray(data?.variants) ? data.variants : []);
      
      // Reset form
      setSelectedSizes([]);
      setSizeDetails([]);
      setValidationErrors({});
      setColorImageFile(null);
      setColorImagePreview("");
      setColorImageUrl("");
      toast.success("Đã thêm biến thể cho màu này!");
    } catch (error) {
      toast.error("Thêm biến thể thất bại!");
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
          <label>Giá cơ bản</label>
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
          <label>Số lượng kho cơ bản</label>
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
            <span className="variant-count">({variants.length} biến thể hiện có)</span>
          )}
        </div>
        {showVariantForm && (
          <div className="variant-form-section">
            <div className="variant-form">
              <div>
                <label>Màu sắc:</label>
                <select name="color" value={selectedColor} onChange={handleColorSelect} required>
                  <option value="">-- Chọn màu --</option>
                  {colors.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {selectedColor && (
                <div>
                  <label>Chọn size cho màu này:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {sizes.map((s) => {
                      const isChecked = selectedSizes.includes(s._id);
                      const isDisabled = variants.some(v => {
                        const colorId = typeof v.attributes.color === "object" ? v.attributes.color._id : v.attributes.color;
                        const sizeId = typeof v.attributes.size === "object" ? v.attributes.size._id : v.attributes.size;
                        return colorId === selectedColor && sizeId === s._id;
                      });
                      return (
                        <label key={s._id} style={{ opacity: isDisabled ? 0.5 : 1 }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() => handleSizeToggle(s._id)}
                          />
                          {s.name}
                        </label>
                      );
                    })}
                  </div>
                  
                  {/* Section upload ảnh cho màu sắc */}
                  <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>
                      Ảnh đại diện cho màu {colors.find(c => c._id === selectedColor)?.name}
                    </h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                      Ảnh này sẽ được sử dụng cho tất cả size của màu này (trừ khi size có ảnh riêng)
                    </p>
                    
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                          Upload ảnh màu:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleColorImageChange}
                          style={{ width: '100%', padding: 8 }}
                        />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                          Hoặc nhập link ảnh:
                        </label>
                        <input
                          type="text"
                          value={colorImageUrl}
                          onChange={handleColorImageUrlChange}
                          placeholder="Dán link ảnh màu sắc"
                          style={{ 
                            width: '100%', 
                            padding: 8,
                            border: '1px solid #ddd',
                            borderRadius: 4
                          }}
                          disabled={!!colorImageFile}
                        />
                      </div>
                    </div>
                    
                    {/* Preview ảnh màu */}
                    {(colorImagePreview || colorImageUrl) && (
                      <div style={{ marginTop: 12 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                          Preview ảnh màu:
                        </label>
                        <img 
                          src={colorImagePreview || colorImageUrl} 
                          alt="Color preview" 
                          style={{ 
                            width: 80, 
                            height: 80, 
                            objectFit: 'cover', 
                            border: '2px solid #ddd',
                            borderRadius: 8
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Hiển thị số lượng biến thể đã chọn */}
                  {selectedSizes.length > 0 && (
                    <div style={{ marginBottom: 16, color: '#666', fontSize: '14px' }}>
                      Đã chọn {selectedSizes.length} size cho màu {colors.find(c => c._id === selectedColor)?.name}
                    </div>
                  )}
                  
                  {/* Form chi tiết cho từng size đã chọn */}
                  {sizeDetails.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <h4>Thông tin chi tiết cho từng size:</h4>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ padding: 8, border: '1px solid #ddd' }}>Size</th>
                            <th style={{ padding: 8, border: '1px solid #ddd' }}>Giá</th>
                            <th style={{ padding: 8, border: '1px solid #ddd' }}>Kho</th>
                            <th style={{ padding: 8, border: '1px solid #ddd' }}>SKU</th>
                            <th style={{ padding: 8, border: '1px solid #ddd' }}>Ảnh riêng (tùy chọn)</th>
                            <th style={{ padding: 8, border: '1px solid #ddd' }}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sizeDetails.map((detail) => {
                            const sizeName = sizes.find(s => s._id === detail.size)?.name || detail.size;
                            return (
                              <tr key={detail.size}>
                                <td style={{ padding: 8, border: '1px solid #ddd' }}>{sizeName}</td>
                                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                                  <input
                                    type="number"
                                    value={detail.price}
                                    onChange={(e) => handleSizeDetailChange(detail.size, 'price', Number(e.target.value))}
                                    min={0}
                                    style={{ 
                                      width: '100%', 
                                      padding: 4,
                                      border: validationErrors[`${detail.size}-price`] ? '1px solid red' : '1px solid #ddd'
                                    }}
                                  />
                                  {validationErrors[`${detail.size}-price`] && (
                                    <div style={{ color: 'red', fontSize: '12px', marginTop: 2 }}>
                                      {validationErrors[`${detail.size}-price`]}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                                  <input
                                    type="number"
                                    value={detail.stock_quantity}
                                    onChange={(e) => handleSizeDetailChange(detail.size, 'stock_quantity', Number(e.target.value))}
                                    min={0}
                                    style={{ 
                                      width: '100%', 
                                      padding: 4,
                                      border: validationErrors[`${detail.size}-stock_quantity`] ? '1px solid red' : '1px solid #ddd'
                                    }}
                                  />
                                  {validationErrors[`${detail.size}-stock_quantity`] && (
                                    <div style={{ color: 'red', fontSize: '12px', marginTop: 2 }}>
                                      {validationErrors[`${detail.size}-stock_quantity`]}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    <input
                                      type="text"
                                      value={detail.sku}
                                      onChange={(e) => handleSizeDetailChange(detail.size, 'sku', e.target.value)}
                                      placeholder="Nhập SKU"
                                      style={{ 
                                        flex: 1,
                                        padding: 4,
                                        border: validationErrors[`${detail.size}-sku`] ? '1px solid red' : '1px solid #ddd'
                                      }}
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSizeDetailChange(detail.size, 'sku', generateSKU(detail.size))}
                                      style={{ padding: '4px 8px', fontSize: '12px' }}
                                      title="Tự động sinh SKU"
                                    >
                                      Auto
                                    </button>
                                  </div>
                                  {validationErrors[`${detail.size}-sku`] && (
                                    <div style={{ color: 'red', fontSize: '12px', marginTop: 2 }}>
                                      {validationErrors[`${detail.size}-sku`]}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <input
                                      type="text"
                                      value={detail.image_url}
                                      onChange={(e) => handleSizeDetailChange(detail.size, 'image_url', e.target.value)}
                                      placeholder="Link ảnh riêng (tùy chọn)"
                                      style={{ width: '100%', padding: 4 }}
                                    />
                                    {detail.image_url && (
                                      <img 
                                        src={detail.image_url} 
                                        alt="Preview" 
                                        style={{ width: 40, height: 40, objectFit: 'cover', border: '1px solid #ddd' }}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    {!detail.image_url && (colorImagePreview || colorImageUrl) && (
                                      <div style={{ fontSize: '12px', color: '#666' }}>
                                        Sẽ dùng ảnh màu chung
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSize(detail.size)}
                                    style={{ 
                                      padding: '4px 8px', 
                                      backgroundColor: '#ff4444', 
                                      color: 'white', 
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                    title="Xóa size này"
                                  >
                                    Xóa
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              <button type="button" className="add-variant-btn" onClick={handleAddVariantsByColor}>
                Thêm biến thể cho màu này
              </button>
            </div>
          </div>
        )}
        <div className="variant-list-section">
          <h4>Danh sách biến thể (theo nhóm màu):</h4>
          {variants.length > 0 ? (
            colors.map((color) => {
              const colorVariants = variants.filter(v => {
                const colorId = typeof v.attributes.color === "object" ? v.attributes.color._id : v.attributes.color;
                return colorId === color._id;
              });
              if (colorVariants.length === 0) return null;
              return (
                <div key={color._id} style={{ marginBottom: 16 }}>
                  <strong>{color.name}</strong>
                  <table className="variant-table">
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>Giá</th>
                        <th>Kho</th>
                        <th>SKU</th>
                        <th>Trạng thái</th>
                        <th>Ảnh</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {colorVariants.map((v) => (
                        <tr key={v._id}>
                          <td>{getVariantSizeName(v)}</td>
                          <td>{v.price?.toLocaleString() || "0"}</td>
                          <td>{v.stock_quantity || "0"}</td>
                          <td>{v.sku}</td>
                          <td>
                            <span className={`status-badge ${v.is_active ? 'active' : 'inactive'}`}>
                              {v.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            {v.image_url ? (
                              <img src={v.image_url} alt="variant" style={{ width: 40, height: 40, objectFit: "cover" }} />
                            ) : (
                              <span className="text-gray-400">No image</span>
                            )}
                          </td>
                          <td>
                            <button type="button" className="delete-image-btn" onClick={() => v._id && handleRemoveVariant(v._id)}>
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          ) : (
            <div style={{ padding: 16, textAlign: "center", color: "#666" }}>
              Chưa có biến thể nào
            </div>
          )}
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
