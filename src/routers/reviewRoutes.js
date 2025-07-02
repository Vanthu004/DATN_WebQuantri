// src/routers/reviewRoutes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Đúng: không lặp lại /reviews nữa
router.post("/", reviewController.createReview);
router.get("/", reviewController.getReviews);
router.get("/:id", reviewController.getReviewById);
router.put("/:id", reviewController.updateReview);

router.delete("/:id", reviewController.deleteReview);

module.exports = router;
