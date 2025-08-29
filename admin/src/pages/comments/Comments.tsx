import React, { useEffect, useState } from "react";
import axios from "axios";

interface Reply {
  _id: string;
  user_id?: { _id: string; name: string; avatar_url?: string; role?: string };
  comment: string;
  create_date: string;
}

interface Review {
  _id: string;
  user_id?: { _id: string; name: string; avatar_url?: string; role?: string };
  product_id?: { _id: string; name: string; main_image?: string };
  rating: number;
  comment: string;
  image_urls?: string[];
  create_date: string;
  replies?: Reply[];
}

const Comments: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("Lỗi lấy bình luận:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      try {
        await axios.delete(`http://localhost:3000/api/reviews/${id}`);
        fetchReviews();
      } catch (err) {
        console.error("Lỗi xóa bình luận:", err);
      }
    }
  };

  const handleReplyClick = (reviewId: string) => {
    setReplyingTo(reviewId);
    setReplyContent("");
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return alert("Vui lòng nhập nội dung trả lời");

      console.log("Bắt đầu gửi reply...");

    try {
      const payload = {
        comment: replyContent,
        user_id: "6887346a1e06c46166009644", // ✅ ID admin của bạn
      };

      const res = await axios.post(
        `http://localhost:3000/api/reviews/${parentId}/reply`,
        payload
      );

      console.log("Phản hồi API:", res.data);

      setReplyingTo(null);
      setReplyContent("");
      fetchReviews();
    } catch (err) {
      console.error("Lỗi gửi trả lời:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Bình luận - Đánh giá</h2>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : reviews.length === 0 ? (
        <p>Chưa có bình luận nào.</p>
      ) : (
        <table
          style={{ 
            width: "100%", 
            borderCollapse: "collapse",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600", color: "#495057" }}>
                👤 Người dùng
              </th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600", color: "#495057" }}>
                📦 Sản phẩm
              </th>
              <th style={{ padding: "12px 8px", textAlign: "center", fontWeight: "600", color: "#495057" }}>
                ⭐ Số sao
              </th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600", color: "#495057" }}>
                💬 Bình luận & Trả lời
              </th>
              <th style={{ padding: "12px 8px", textAlign: "center", fontWeight: "600", color: "#495057" }}>
                🖼️ Ảnh bình luận
              </th>
              <th style={{ padding: "12px 8px", textAlign: "center", fontWeight: "600", color: "#495057" }}>
                📅 Ngày tạo
              </th>
              <th style={{ padding: "12px 8px", textAlign: "center", fontWeight: "600", color: "#495057" }}>
                ⚙️ Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <React.Fragment key={r._id}>
                <tr style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={{ padding: "12px 8px", verticalAlign: "top" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img
                        src={r.user_id?.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="avatar"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #e9ecef"
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                          {r.user_id?.name || "Ẩn danh"}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666" }}>
                          {r.user_id?.role || "User"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 8px", verticalAlign: "top" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img
                        src={r.product_id?.main_image || "https://via.placeholder.com/50x50?text=No+Image"}
                        alt="product"
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: "4px",
                          border: "1px solid #e9ecef"
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/50x50?text=No+Image";
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: "500", fontSize: "13px", maxWidth: "150px" }}>
                          {r.product_id?.name || "Không có tên"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 8px", verticalAlign: "top", textAlign: "center" }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                      justifyContent: "center"
                    }}>
                      <span style={{ color: "#ffc107" }}>
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </span>
                      <span style={{ color: "#666", marginLeft: "4px" }}>
                        ({r.rating}/5)
                      </span>
                    </div>
                  </td>
                  <td style={{ maxWidth: "300px", padding: "12px 8px", verticalAlign: "top" }}>
                    <div style={{ 
                      padding: "8px", 
                      background: "#f8f9fa", 
                      borderRadius: "4px",
                      marginBottom: "8px"
                    }}>
                      {r.comment}
                    </div>
                    {r.replies?.length ? (
                      <ul style={{ marginTop: 5, listStyle: "none", padding: 0 }}>
                        {r.replies.map((rep) => (
                          <li key={rep._id} style={{ 
                            marginBottom: "8px", 
                            padding: "8px", 
                            background: "#f8f9fa", 
                            borderRadius: "4px",
                            borderLeft: "3px solid #007bff"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <img
                                src={rep.user_id?.avatar_url || "/default-avatar.png"}
                                alt="avatar"
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  objectFit: "cover"
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = "/default-avatar.png";
                                }}
                              />
                              <span style={{ 
                                fontWeight: "bold", 
                                color: rep.user_id?.role === "admin" ? "#dc3545" : "#28a745",
                                fontSize: "12px"
                              }}>
                                {rep.user_id?.name || "Ẩn danh"}
                                {rep.user_id?.role === "admin" && " (Admin)"}
                              </span>
                            </div>
                            <div style={{ marginLeft: "32px", color: "#666" }}>
                              {rep.comment}
                            </div>
                            <div style={{ 
                              marginLeft: "32px", 
                              fontSize: "11px", 
                              color: "#999",
                              marginTop: "4px"
                            }}>
                              {new Date(rep.create_date).toLocaleString("vi-VN")}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </td>
                  <td style={{ padding: "12px 8px", verticalAlign: "top", textAlign: "center" }}>
                    {r.image_urls && r.image_urls.length > 0 ? (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {r.image_urls.map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt="review"
                            style={{ 
                              width: 60, 
                              height: 60, 
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #e9ecef",
                              cursor: "pointer"
                            }}
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/60x60?text=Error";
                            }}
                            onClick={() => window.open(url, '_blank')}
                            title="Click để xem ảnh lớn"
                          />
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "#999", fontStyle: "italic" }}>Không có ảnh</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 8px", verticalAlign: "top", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      <div>{new Date(r.create_date).toLocaleDateString("vi-VN")}</div>
                      <div>{new Date(r.create_date).toLocaleTimeString("vi-VN", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}</div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 8px", verticalAlign: "top", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleReplyClick(r._id)}
                        style={{ 
                          padding: "6px 12px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0056b3"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
                      >
                        💬 Trả lời
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        style={{ 
                          padding: "6px 12px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#c82333"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#dc3545"}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>

                {replyingTo === r._id && (
                  <tr>
                    <td colSpan={7} style={{ background: "#f8f9fa", padding: "16px" }}>
                      <div style={{ 
                        border: "2px solid #007bff", 
                        borderRadius: "8px", 
                        padding: "16px",
                        background: "white"
                      }}>
                        <h4 style={{ margin: "0 0 12px 0", color: "#007bff" }}>
                          💬 Trả lời bình luận
                        </h4>
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={4}
                          style={{ 
                            width: "100%", 
                            padding: "12px", 
                            border: "1px solid #ced4da",
                            borderRadius: "4px",
                            fontSize: "14px",
                            resize: "vertical"
                          }}
                          placeholder="Nhập câu trả lời của bạn..."
                        />
                        <div
                          style={{
                            marginTop: "12px",
                            display: "flex",
                            gap: "12px",
                            justifyContent: "flex-end"
                          }}
                        >
                          <button 
                            onClick={() => setReplyingTo(null)}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#6c757d",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            ❌ Hủy
                          </button>
                          <button 
                            onClick={() => handleReplySubmit(r._id)}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            ✅ Gửi trả lời
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Comments;
