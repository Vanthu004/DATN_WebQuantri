const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Route cụ thể luôn đặt trước route động
router.post("/", reviewController.createReview);
router.get("/", reviewController.getReviews);

// ✅ Thêm route lấy theo product_id (đặt trước /:id)
router.get("/product/:id", reviewController.getReviewsByProductId);

// ✅ Route lấy theo user_id
router.get("/user/:user_id", reviewController.getReviewsByUserId);

router.get("/:id", reviewController.getReviewById);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
