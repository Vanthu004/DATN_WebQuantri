const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); // ✅ dùng middleware đã tách riêng
const reviewController = require("../controllers/reviewController");

// POST review có thể kèm ảnh
router.post("/", upload.single("image"), reviewController.createReview);

// Các route khác
router.get("/", reviewController.getReviews);
router.get("/product/:id", reviewController.getReviewsByProductId);
router.get("/user/:user_id", reviewController.getReviewsByUserId);
router.get("/:id", reviewController.getReviewById);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
