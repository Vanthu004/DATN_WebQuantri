import { useEffect, useState } from "react";
import { getAllProducts, deleteProduct, restoreProduct } from "../../services/product";
import Product from "../../interfaces/product";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllCategories } from "../../services/category";
import Category from "../../interfaces/category";
import "../../css/products/listProduct.css";
import React from "react";

const ListProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [includeVariants, setIncludeVariants] = useState(false);

  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
  }, [showDeleted, includeVariants]);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const data = await getAllProducts(showDeleted, false, includeVariants);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm!");
      setProducts([]);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này? Sản phẩm sẽ chuyển thành inactive và không hiển thị trên app.")) return;
    try {
      await deleteProduct(id);
      toast.success("Xóa sản phẩm thành công! Sản phẩm đã chuyển thành inactive.");
      fetchAllProducts();
    } catch (error) {
      toast.error("Xóa sản phẩm thất bại!");
    }
  };

  const handleRestoreProduct = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn khôi phục sản phẩm này?")) return;
    try {
      await restoreProduct(id);
      toast.success("Khôi phục sản phẩm thành công! Sản phẩm đã chuyển thành active.");
      fetchAllProducts();
    } catch (error) {
      toast.error("Khôi phục sản phẩm thất bại!");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getCategoryName = (product: Product) => {
    if (typeof product.category_id === "object" && product.category_id?.name) {
      return product.category_id.name;
    }
    const category = categories.find((cat) => cat._id === product.category_id);
    return category?.name || "--";
  };

  const formatDate = (dateString: string) => {
    if (!dateString || isNaN(Date.parse(dateString))) return "";
    return new Date(dateString).toLocaleString();
  };

  const renderProductName = (product: Product) => {
    if (!product.name) return "--";
    if (product.name.length > 20) {
      return (
        <>
          {expandedRows[product._id] ? product.name : product.name.slice(0, 20) + "..."}
          <button className="toggle-btn" onClick={() => toggleExpand(product._id)}>
            {expandedRows[product._id] ? "Ẩn bớt" : "Xem thêm"}
          </button>
        </>
      );
    }
    return product.name;
  };

  const renderProductDescription = (product: Product) => {
    if (!product.description) return "--";
    const descKey = product._id + "_desc";
    if (product.description.length > 40) {
      return (
        <>
          {expandedRows[descKey]
            ? product.description
            : product.description.slice(0, 40) + "..."}
          <button className="toggle-btn" onClick={() => toggleExpand(descKey)}>
            {expandedRows[descKey] ? "Ẩn bớt" : "Xem thêm"}
          </button>
        </>
      );
    }
    return product.description;
  };

  const getPriceDisplay = (product: Product) => {
    if (product.has_variants) {
      if (product.min_price === product.max_price) {
        return product.min_price?.toLocaleString() || "0";
      }
      return `${product.min_price?.toLocaleString() || "0"} - ${product.max_price?.toLocaleString() || "0"}`;
    }
    return product.price?.toLocaleString() || "0";
  };

  const getStockDisplay = (product: Product) => {
    if (product.has_variants) {
      return product.total_stock || "0";
    }
    return product.stock_quantity || "0";
  };

  const getMainImage = (product: Product) => {
    return product.main_image || product.image_url || "";
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4 gap-2">
        <button
          className={`option-btn ${!showDeleted ? "active" : ""}`}
          onClick={() => setShowDeleted(false)}
        >
          Sản phẩm chưa bị xóa
        </button>
        <button
          className={`option-btn ${showDeleted ? "active" : ""}`}
          onClick={() => setShowDeleted(true)}
        >
          Sản phẩm đã xóa
        </button>
        <button
          className={`option-btn ${includeVariants ? "active" : ""}`}
          onClick={() => setIncludeVariants(!includeVariants)}
        >
          {includeVariants ? "Ẩn biến thể" : "Hiện biến thể"}
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ml-auto"
          onClick={() => navigate("/products/add")}
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="product-table-scroll">
        <table className="min-w-max w-full bg-white rounded-lg shadow border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b">#</th>
              <th className="px-4 py-2 border-b">ID</th>
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">Description</th>
              <th className="px-4 py-2 border-b">Price</th>
              <th className="px-4 py-2 border-b">Stock</th>
              <th className="px-4 py-2 border-b">Status</th>
              <th className="px-4 py-2 border-b">Category</th>
              <th className="px-4 py-2 border-b">Image</th>
              <th className="px-4 py-2 border-b">Variants</th>
              <th className="px-4 py-2 border-b">Sold</th>
              <th className="px-4 py-2 border-b">Views</th>
              <th className="px-4 py-2 border-b">Đã xóa?</th>
              <th className="px-4 py-2 border-b">Created At</th>
              <th className="px-4 py-2 border-b">Updated At</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter((product) => product.is_deleted === showDeleted)
              .map((product: Product, index: number) => (
                <React.Fragment key={product._id}>
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{index + 1}</td>
                    <td className="px-4 py-2 border-b">{product._id || "--"}</td>
                    <td className="px-4 py-2 border-b">{renderProductName(product)}</td>
                    <td className="px-4 py-2 border-b">{renderProductDescription(product)}</td>
                    <td className="px-4 py-2 border-b">{getPriceDisplay(product)}</td>
                    <td className="px-4 py-2 border-b">{getStockDisplay(product)}</td>
                    <td className="px-4 py-2 border-b">
                      <span className={`status-badge ${product.status || "inactive"}`}>
                        {product.status || "inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b">{getCategoryName(product)}</td>
                    <td className="px-4 py-2 border-b">
                      {getMainImage(product) ? (
                        <img
                          src={getMainImage(product)}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21,15 16,10 5,21'/%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 italic">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {product.has_variants ? (
                        <span className="text-blue-600 font-medium">
                          {product.total_variants || 0} variants
                        </span>
                      ) : (
                        <span className="text-gray-500">No variants</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b">{product.sold_quantity || "0"}</td>
                    <td className="px-4 py-2 border-b">{product.views || "0"}</td>
                    <td className="px-4 py-2 border-b">
                      {product.is_deleted ? (
                        <span className="deleted-badge">Đã xóa</span>
                      ) : (
                        <span className="not-deleted-badge">Chưa xóa</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b">{formatDate(product.createdAt)}</td>
                    <td className="px-4 py-2 border-b">{formatDate(product.updatedAt)}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        className="action-btn edit"
                        onClick={() => navigate(`/products/update/${product._id}`)}
                        disabled={product.is_deleted}
                      >
                        Sửa
                      </button>
                      {" | "}
                      {!product.is_deleted ? (
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Xóa
                        </button>
                      ) : (
                        <button
                          className="action-btn restore"
                          onClick={() => handleRestoreProduct(product._id)}
                        >
                          Khôi phục
                        </button>
                      )}
                      {product.has_variants && (
                        <>
                          <span style={{ marginLeft: 8 }}></span>
                          <button
                            className="action-btn variant"
                            onClick={() => setExpandedRows((prev) => ({ ...prev, [product._id + "_variants"]: !prev[product._id + "_variants"] }))}
                          >
                            {expandedRows[product._id + "_variants"] ? "Ẩn biến thể" : "Xem biến thể"}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {expandedRows[product._id + "_variants"] && product.variants && product.variants.length > 0 && (
                    <tr>
                      <td colSpan={17} className="variant-table-cell">
                        <table className="variant-table">
                          <thead>
                            <tr>
                              <th>Size</th>
                              <th>Màu</th>
                              <th>Giá</th>
                              <th>Kho</th>
                              <th>SKU</th>
                              <th>Trạng thái</th>
                              <th>Ảnh</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.variants.map((v) => (
                              <tr key={v._id}>
                                <td>{v.size_name || (typeof v.attributes.size === "object" && v.attributes.size !== null && "name" in v.attributes.size ? v.attributes.size.name : v.attributes.size)}</td>
                                <td>{v.color_name || (typeof v.attributes.color === "object" && v.attributes.color !== null && "name" in v.attributes.color ? v.attributes.color.name : v.attributes.color)}</td>
                                <td>{v.price?.toLocaleString() || "0"}</td>
                                <td>{v.stock_quantity || "0"}</td>
                                <td>{v.sku}</td>
                                <td>
                                  <span className={`status-badge ${v.is_active ? 'active' : 'inactive'}`}>
                                    {v.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td>{v.image_url ? <img src={v.image_url} alt="variant" style={{ width: 40, height: 40, objectFit: "cover" }} /> : ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListProduct;
