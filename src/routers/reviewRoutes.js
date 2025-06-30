const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Tạo review mới
router.post("/reviews", reviewController.createReview);

// Lấy tất cả review
router.get("/reviews", reviewController.getReviews);

// Lấy review theo ID
router.get("/reviews/:id", reviewController.getReviewById);

// Cập nhật review
router.put("/reviews/:id", reviewController.updateReview);

// Xóa review
router.delete("/reviews/:id", reviewController.deleteReview);

module.exports = router;