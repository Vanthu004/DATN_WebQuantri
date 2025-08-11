const express = require("express");
const router = express.Router();
const salesStatisticsController = require("../controllers/salesStatisticsController");

// Thống kê doanh thu theo thời gian
router.get("/revenue", salesStatisticsController.getRevenueStatistics);

// Thống kê sản phẩm bán chạy
router.get("/top-products", salesStatisticsController.getTopSellingProducts);

// Thống kê tổng quan dashboard
router.get("/dashboard", salesStatisticsController.getDashboardStatistics);

// Lấy thống kê theo khoảng thời gian
router.get("/date-range", salesStatisticsController.getStatisticsByDateRange);

// Tạo thống kê theo ngày (cron job)
router.post("/generate-daily", salesStatisticsController.generateDailyStatistics);

module.exports = router; 