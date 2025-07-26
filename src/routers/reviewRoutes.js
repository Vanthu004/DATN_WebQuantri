const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Route cụ thể luôn đặt trước route động
router.post("/", reviewController.createReview);
router.get("/", reviewController.getReviews);

// ✅ Đặt trước để tránh bị route /:id bắt nhầm
router.get("/user/:user_id", reviewController.getReviewsByUserId);

router.get("/:id", reviewController.getReviewById);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
