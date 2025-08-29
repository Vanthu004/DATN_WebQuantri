import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductReviews } from "../../services/product";
import { Review, RatingStats } from "../../interfaces/product";
import { toast } from "react-toastify";
import "../../css/products/productReviews.css";

interface ProductReviewsData {
  product: {
    _id: string;
    name: string;
    image_url: string;
  };
  reviews: Review[];
  rating: RatingStats;
}

interface ApiResponse {
  success: boolean;
  data: ProductReviewsData;
  message: string;
}

const ProductReviews = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ProductReviewsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductReviews();
    }
  }, [id]);

  const fetchProductReviews = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await getProductReviews(id) as ApiResponse;
      if (response.success) {
        setData(response.data);
      } else {
        toast.error(response.message || "Không thể tải thông tin đánh giá");
      }
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      toast.error("Không thể tải thông tin đánh giá sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? "filled" : "empty"}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600">Đang tải thông tin đánh giá...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">Không có thông tin đánh giá</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Đánh giá sản phẩm: {data.product.name}
        </h2>
        
        {/* Product Info */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center">
            {data.product.image_url && (
              <img
                src={data.product.image_url}
                alt={data.product.name}
                className="w-16 h-16 object-cover rounded mr-4"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold">{data.product.name}</h3>
              <p className="text-gray-600">ID: {data.product._id}</p>
            </div>
          </div>
        </div>

        {/* Rating Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Tổng quan đánh giá</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {data.rating.average}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(data.rating.average))}
              </div>
              <p className="text-gray-600">
                {data.rating.total} đánh giá
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="col-span-2">
              <h4 className="font-semibold mb-3">Phân bố đánh giá</h4>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center mb-2">
                  <span className="w-8 text-sm">{star} sao</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${data.rating.percentages[star] || 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="w-12 text-sm text-gray-600">
                    {data.rating.stats[star] || 0}
                  </span>
                  <span className="w-12 text-sm text-gray-500">
                    ({data.rating.percentages[star] || 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold">
              Danh sách đánh giá ({data.reviews.length})
            </h3>
          </div>

          {data.reviews.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Chưa có đánh giá nào cho sản phẩm này
            </div>
          ) : (
            <div className="divide-y">
              {data.reviews.map((review) => (
                <div key={review._id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      {review.user_id.avatar ? (
                        <img
                          src={review.user_id.avatar}
                          alt={review.user_id.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {review.user_id.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{review.user_id.name}</p>
                        <p className="text-sm text-gray-500">
                          {review.user_id.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex mb-1">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.create_date)}
                      </p>
                    </div>
                  </div>
                  
                  {review.comment && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews; 