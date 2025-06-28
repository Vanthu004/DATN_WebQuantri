// src/routers/reviewRoutes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Tạo review mới
router.post("/", reviewController.createReview);

// Lấy tất cả review
router.get("/", reviewController.getReviews);

// Lấy review theo ID
router.get("/:id", reviewController.getReviewById);

// Cập nhật review
router.put("/:id", reviewController.updateReview);

// Xóa review
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
