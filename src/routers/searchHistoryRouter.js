const express = require("express");
const router = express.Router();
const searchHistoryCtrl = require("../controllers/searchHistoryController");
const authMiddleware = require("../middlewares/authMiddleware");

// Middleware xác thực (optional cho một số routes)
const optionalAuth = (req, res, next) => {
  try {
    authMiddleware(req, res, next);
  } catch (error) {
    // Nếu không có token hoặc token không hợp lệ, vẫn cho phép tiếp tục
    next();
  }
};

// Routes cho từ khóa phổ biến (có thể truy cập không cần đăng nhập)
router.get('/popular', searchHistoryCtrl.getPopularKeywords);
router.get('/realtime-popular', searchHistoryCtrl.getRealTimePopularKeywords);

// Routes cho lịch sử tìm kiếm cá nhân (cần đăng nhập)
router.get('/history', optionalAuth, searchHistoryCtrl.getUserSearchHistory);
router.get('/recent', optionalAuth, searchHistoryCtrl.getRecentSearches);
router.get('/suggestions', optionalAuth, searchHistoryCtrl.getSearchSuggestions);

// Routes để thêm/xóa lịch sử tìm kiếm (cần đăng nhập)
router.post('/add', optionalAuth, searchHistoryCtrl.addSearchHistory);
router.delete('/delete', optionalAuth, searchHistoryCtrl.deleteSearchHistory);

// Routes cho thống kê (có thể cần quyền admin)
router.get('/stats', searchHistoryCtrl.getSearchStats);

module.exports = router;