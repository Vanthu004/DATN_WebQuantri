const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const reviewController = require("../controllers/reviewController");

// ============================
// Review chính
// ============================

// Tạo review mới (có thể kèm ảnh)
router.post("/", upload.single("image"), reviewController.createReview);

// Lấy danh sách tất cả reviews
router.get("/", reviewController.getReviews);

// Lấy review theo product_id
router.get("/product/:id", reviewController.getReviewsByProductId);

// Lấy review theo user_id
router.get("/user/:user_id", reviewController.getReviewsByUserId);

// Lấy review theo id
router.get("/:id", reviewController.getReviewById);

// Cập nhật review
router.put("/:id", reviewController.updateReview);

// Xóa review
router.delete("/:id", reviewController.deleteReview);

// ============================
// Reply cho review
// ============================

// Thêm reply cho review (đổi thành /reply cho đồng nhất với FE)
router.post("/:id/reply", reviewController.addReply);

// Xóa reply
router.delete("/:id/reply/:replyId", reviewController.deleteReply);

module.exports = router;
