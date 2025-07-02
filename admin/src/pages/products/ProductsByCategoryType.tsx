import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductsByCategoryType } from "../../services/product";
import { getAllCategoryTypes } from "../../services/categoryType";
import Product from "../../interfaces/product";
import CategoryType from "../../interfaces/categoryType";
import { toast } from "react-toastify";

const ProductsByCategoryType = () => {
  const { type } = useParams<{ type: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchCategoryTypes = async () => {
    try {
      const types = await getAllCategoryTypes();
      setCategoryTypes(types);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProducts = async (page: number = 1) => {
    if (!type) return;
    
    setLoading(true);
    try {
      const response = await getProductsByCategoryType(type, page, 12);
      setProducts(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalProducts(response.pagination.total);
    } catch (error) {
      toast.error("Lỗi tải sản phẩm");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategoryTypes();
  }, []);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [type, currentPage]);

  const getCategoryTypeName = (typeCode: string) => {
    const categoryType = categoryTypes.find(ct => ct.code === typeCode);
    return categoryType ? categoryType.name : typeCode;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!type) {
    return <div>Sai loại danh mục</div>;
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Sản phẩm theo loại: {getCategoryTypeName(type)}
        </h2>
        <p className="text-gray-600">
          Tổng cộng {totalProducts} sản phẩm
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image_url || "https://via.placeholder.com/300"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 truncate">
                    {product.name}
                  </h3>
                  <p className="text-red-600 font-bold text-lg mb-2">
                    {product.price?.toLocaleString("vi-VN")}đ
                  </p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Đã bán: {product.sold_quantity || 0}</span>
                    <span>Lượt xem: {product.views || 0}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Danh mục: {product.category_name || "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Trước
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsByCategoryType; 