const express = require("express");
const router = express.Router();
const multer = require("multer");
const reviewController = require("../controllers/reviewController");

// Cấu hình multer để nhận file từ form-data (giống như sản phẩm)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ============================
// Review chính
// ============================

// Tạo review mới (hỗ trợ nhiều ảnh: field "images" và tương thích "image")
router.post("/", upload.fields([{ name: "images", maxCount: 10 }, { name: "image", maxCount: 1 }]), reviewController.createReview);

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
