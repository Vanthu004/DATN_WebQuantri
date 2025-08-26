const express = require("express");
const router = express.Router();
const salesStatisticsController = require("../controllers/salesStatisticsController");
const authMiddleware = require("../middlewares/authMiddleware");

// Test endpoint để kiểm tra data (tạm thời không cần auth)
router.get("/test", salesStatisticsController.testData);

// Thống kê doanh thu theo thời gian
router.get(
  "/revenue",
  authMiddleware,
  salesStatisticsController.getRevenueStatistics
);

// Thống kê sản phẩm bán chạy
router.get(
  "/top-products",
  authMiddleware,
  salesStatisticsController.getTopSellingProducts
);

// Thống kê tổng quan dashboard
router.get(
  "/dashboard",
  authMiddleware,
  salesStatisticsController.getDashboardStatistics
);

// Lấy thống kê theo khoảng thời gian
router.get(
  "/date-range",
  authMiddleware,
  salesStatisticsController.getStatisticsByDateRange
);

// Tạo thống kê theo ngày (cron job)
router.post(
  "/generate-daily",
  authMiddleware,
  salesStatisticsController.generateDailyStatistics
);

module.exports = router;
