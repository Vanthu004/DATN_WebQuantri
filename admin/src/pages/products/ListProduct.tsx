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

  useEffect(() => {
    fetchAllProducts();
    getAllCategories().then((data) => {
      if (Array.isArray(data)) setCategories(data);
      else setCategories([]);
    });
    // eslint-disable-next-line
  }, [showDeleted]);

  const fetchAllProducts = async () => {
    try {
      const data = await getAllProducts(showDeleted);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
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
      <div className="overflow-x-auto">
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
            {products.map((product: Product, index: number) => (
              <tr key={product.product_id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{index + 1}</td>
                <td className="px-4 py-2 border-b">{product.product_id}</td>
                <td className="px-4 py-2 border-b">{product.name}</td>
                <td className="px-4 py-2 border-b">{product.description}</td>
                <td className="px-4 py-2 border-b">{product.price}</td>
                <td className="px-4 py-2 border-b">{product.stock_quantity}</td>
                <td className="px-4 py-2 border-b">
                  <span className={`status-badge ${product.status}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-2 border-b">
                  {typeof product.category_id === "object"
                    ? product.category_id?.name
                    : categories.find((cat) => cat._id === product.category_id)
                        ?.name || "--"}
                </td>
                <td className="px-4 py-2 border-b">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 italic">No image</span>
                  )}
                </td>
                <td className="px-4 py-2 border-b">{product.sold_quantity}</td>
                <td className="px-4 py-2 border-b">
                  {product.is_deleted ? (
                    <span className="deleted-badge">Đã xóa</span>
                  ) : (
                    <span className="not-deleted-badge">Chưa xóa</span>
                  )}
                </td>
                <td className="px-4 py-2 border-b">
                  {product.createdAt && !isNaN(Date.parse(product.createdAt))
                    ? new Date(product.createdAt).toLocaleString()
                    : ""}
                </td>
                <td className="px-4 py-2 border-b">
                  {product.updatedAt && !isNaN(Date.parse(product.updatedAt))
                    ? new Date(product.updatedAt).toLocaleString()
                    : ""}
                </td>
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
    </div>
  );
};

export default ListProduct;
