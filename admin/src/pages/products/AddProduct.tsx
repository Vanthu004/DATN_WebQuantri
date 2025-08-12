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

// Thêm interface cho form size detail
interface SizeDetailForm {
  size: string;
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

  // Thêm các state mới để chọn màu trước và chọn nhiều size cho màu đó
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
    if (!selectedColor || selectedSizes.length === 0) {
      toast.error("Vui lòng chọn màu và ít nhất một size!");
      return;
    }
    
    // Kiểm tra trùng lặp
    const duplicates = selectedSizes.filter(sizeId =>
      variants.some(v => v.color === selectedColor && v.size === sizeId)
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
    
    // Thêm từng biến thể với thông tin chi tiết và ảnh màu chung
    setVariants((prev) => [
      ...prev,
      ...sizeDetails.map(detail => ({
        size: detail.size,
        color: selectedColor,
        price: detail.price,
        stock_quantity: detail.stock_quantity,
        sku: detail.sku,
        image_url: detail.image_url || finalColorImageUrl // Sử dụng ảnh riêng nếu có, không thì dùng ảnh màu chung
      }))
    ]);
    
    // Reset form
    setSelectedSizes([]);
    setSizeDetails([]);
    setValidationErrors({});
    setColorImageFile(null);
    setColorImagePreview("");
    setColorImageUrl("");
    toast.success("Đã thêm biến thể cho màu này!");
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
                      const isDisabled = variants.some(v => v.color === selectedColor && v.size === s._id);
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
        
        {variants.length > 0 && (
          <div className="variant-list-section">
            <h4>Danh sách biến thể đã thêm (theo nhóm màu):</h4>
            {colors.map((color) => {
              const colorVariants = variants.filter(v => v.color === color._id);
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
                        <th>Ảnh</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {colorVariants.map((v, idx) => (
                        <tr key={idx}>
                          <td>{getSizeName(v.size)}</td>
                          <td>{v.price?.toLocaleString() || "0"}</td>
                          <td>{v.stock_quantity || "0"}</td>
                          <td>{v.sku}</td>
                          <td>{v.image_url ? (<img src={v.image_url} alt="variant" style={{ width: 40 }} />) : null}</td>
                          <td><button type="button" onClick={() => handleRemoveVariant(idx)}>Xóa</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
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