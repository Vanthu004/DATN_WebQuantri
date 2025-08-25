import React, { useEffect, useState } from "react";
import axios from "axios";

interface Reply {
  _id: string;
  user_id?: { _id: string; name: string };
  comment: string;
  create_date: string;
}

interface Review {
  _id: string;
  user_id?: { _id: string; name: string; avata_url?: string };
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
          border={1}
          cellPadding={8}
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Sản phẩm</th>
              <th>Số sao</th>
              <th>Bình luận</th>
              <th>Ảnh bình luận</th>
              <th>Ngày</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <React.Fragment key={r._id}>
                <tr>
                  <td>
                    <img
                      src={
                        r.user_id?.avata_url ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="avatar"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        marginRight: 8,
                      }}
                    />
                    {r.user_id?.name || "Ẩn danh"}
                  </td>
                  <td>
                    <img
                      src={r.product_id?.main_image}
                      alt="product"
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        marginRight: 8,
                      }}
                    />
                    {r.product_id?.name}
                  </td>
                  <td>{r.rating} ⭐</td>
                  <td>
                    {r.comment}
                    {r.replies?.length ? (
                      <ul style={{ marginTop: 5 }}>
                        {r.replies.map((rep) => (
                          <li key={rep._id}>
                            <b>{rep.user_id?.name || "Ẩn danh"}:</b> {rep.comment}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </td>
                  <td>
                    {r.image_urls && r.image_urls.length > 0 ? (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {r.image_urls.map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt="review"
                            style={{ width: 60, height: 60, objectFit: "cover" }}
                          />
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{new Date(r.create_date).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleReplyClick(r._id)}
                        style={{ color: "blue" }}
                      >
                        Trả lời
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        style={{ color: "red" }}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>

                {replyingTo === r._id && (
                  <tr>
                    <td colSpan={7} style={{ background: "#f9f9f9" }}>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={3}
                        style={{ width: "100%", padding: "5px" }}
                        placeholder="Nhập câu trả lời..."
                      />
                      <div
                        style={{
                          marginTop: "5px",
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <button onClick={() => handleReplySubmit(r._id)}>
                          Gửi
                        </button>
                        <button onClick={() => setReplyingTo(null)}>Hủy</button>
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
