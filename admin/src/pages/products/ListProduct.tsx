import { useEffect, useState } from "react";
import { getAllProducts, deleteProduct, restoreProduct } from "../../services/product";
import Product from "../../interfaces/product";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllCategories } from "../../services/category";
import Category from "../../interfaces/category";
import "../../css/products/listProduct.css";

const ListProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
  }, [showDeleted]);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts(showDeleted);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm!");
      setProducts([]);
    } finally {
      setLoading(false);
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
          {expandedRows[product.product_id] ? product.name : product.name.slice(0, 20) + "..."}
          <button
            className="toggle-btn"
            onClick={() => toggleExpand(product.product_id)}
          >
            {expandedRows[product.product_id] ? "Ẩn bớt" : "Xem thêm"}
          </button>
        </>
      );
    }
    return product.name;
  };

  const renderProductDescription = (product: Product) => {
    if (!product.description) return "--";
    
    if (product.description.length > 40) {
      return (
        <>
          {expandedRows[product.product_id + "_desc"]
            ? product.description
            : product.description.slice(0, 40) + "..."}
          <button
            className="toggle-btn"
            onClick={() => toggleExpand(product.product_id + "_desc")}
          >
            {expandedRows[product.product_id + "_desc"] ? "Ẩn bớt" : "Xem thêm"}
          </button>
        </>
      );
    }
    return product.description;
  };

  const filteredProducts = products.filter((product) => product.is_deleted === showDeleted);

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
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ml-auto"
          onClick={() => navigate("/products/add")}
        >
          Thêm sản phẩm
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            {showDeleted ? "Không có sản phẩm nào đã bị xóa" : "Không có sản phẩm nào"}
          </p>
        </div>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className="product-table-scroll">
          <table className="min-w-max w-full bg-white rounded-lg shadow border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border-b">#</th>
                <th className="px-4 py-2 border-b">ID</th>
                <th className="px-4 py-2 border-b">Name</th>
                <th className="px-4 py-2 border-b">Description</th>
                <th className="px-4 py-2 border-b">Price</th>
                <th className="px-4 py-2 border-b">Stock Quantity</th>
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b">Category</th>
                <th className="px-4 py-2 border-b">Image</th>
                <th className="px-4 py-2 border-b">Sold Quantity</th>
                <th className="px-4 py-2 border-b">Đã xóa?</th>
                <th className="px-4 py-2 border-b">Created At</th>
                <th className="px-4 py-2 border-b">Updated At</th>
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product: Product, index: number) => (
                <tr key={product.product_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{index + 1}</td>
                  <td className="px-4 py-2 border-b">{product.product_id || "--"}</td>
                  <td className="px-4 py-2 border-b">{renderProductName(product)}</td>
                  <td className="px-4 py-2 border-b">{renderProductDescription(product)}</td>
                  <td className="px-4 py-2 border-b">{product.price?.toLocaleString() || "0"}</td>
                  <td className="px-4 py-2 border-b">{product.stock_quantity || "0"}</td>
                  <td className="px-4 py-2 border-b">
                    <span className={`status-badge ${product.status || "inactive"}`}>
                      {product.status || "inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b">{getCategoryName(product)}</td>
                  <td className="px-4 py-2 border-b">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21,15 16,10 5,21'/%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <span className="text-gray-400 italic">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border-b">{product.sold_quantity || "0"}</td>
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
                    {!product.is_deleted ? (
                      <>
                        {" | "}
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Xóa
                        </button>
                      </>
                    ) : (
                      <>
                        {" | "}
                        <button
                          className="action-btn restore"
                          onClick={() => handleRestoreProduct(product._id)}
                        >
                          Khôi phục
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListProduct;
