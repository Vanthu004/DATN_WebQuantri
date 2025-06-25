const express = require("express");
const router = express.Router();
const statisticCtrl = require("../controllers/statisticController");

// Tạo mới
router.post("/api/statistics", statisticCtrl.createStatistic);

// Lấy tất cả
router.get("/api/statistics", statisticCtrl.getAllStatistics);

// Theo ID thống kê
router.get("/api/statistics/:id", statisticCtrl.getStatisticById);

// Theo sản phẩm
router.get(
  "/api/statistics/product/:productId",
  statisticCtrl.getStatisticsByProduct
);

// Cập nhật
router.put("/api/statistics/:id", statisticCtrl.updateStatistic);

// Xoá
router.delete("/api/statistics/:id", statisticCtrl.deleteStatistic);

module.exports = router;
