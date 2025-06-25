import { useEffect, useState } from "react";
import { getAllProducts, deleteProduct } from "../../services/product";
import Product from "../../interfaces/product";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllCategories } from "../../services/category";
import Category from "../../interfaces/category";

const ListProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetchAllProducts();
    getAllCategories().then((data) => {
      if (Array.isArray(data)) setCategories(data);
      else setCategories([]);
    });
  }, []);

  const fetchAllProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await deleteProduct(id);
      toast.success("Xóa sản phẩm thành công!");
      fetchAllProducts();
    } catch (error) {
      toast.error("Xóa sản phẩm thất bại!");
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
          onClick={() => navigate("/products/add")}
        >
          Thêm sản phẩm
        </button>
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
              <th className="px-4 py-2 border-b">Created At</th>
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
                <td className="px-4 py-2 border-b">{product.status}</td>
                <td className="px-4 py-2 border-b">
                  {typeof product.category_id === "object"
                    ? product.category_id?.name
                    : categories.find((cat) => cat._id === product.category_id)
                        ?.name ||
                      product.category ||
                      "--"}
                </td>
                <td className="px-4 py-2 border-b">{product.image_url}</td>
                <td className="px-4 py-2 border-b">{product.sold_quantity}</td>
                <td className="px-4 py-2 border-b">{product.created_date}</td>
                <td className="px-4 py-2 border-b">
                  <button
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-1 px-3 rounded mr-2 transition duration-200"
                    onClick={() => navigate(`/products/update/${product._id}`)}
                  >
                    Sửa
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded transition duration-200"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    Xóa
                  </button>
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
