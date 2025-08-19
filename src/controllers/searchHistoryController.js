const SearchHistory = require("../models/searchHistory");
const mongoose = require("mongoose");

// Lấy từ khóa tìm kiếm phổ biến
exports.getPopularKeywords = async (req, res) => {
  try {
    const { limit = 10, timeRange = "all" } = req.query;
    
    const popularKeywords = await SearchHistory.getPopularKeywords(
      parseInt(limit),
      timeRange
    );

    res.json({
      success: true,
      data: popularKeywords,
      message: `Lấy danh sách từ khóa phổ biến thành công (${timeRange})`,
    });
  } catch (error) {
    console.error("Get popular keywords error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Lỗi khi lấy từ khóa phổ biến",
    });
  }
};

// Lấy lịch sử tìm kiếm của user
exports.getUserSearchHistory = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const { limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID người dùng",
      });
    }

    const searchHistory = await SearchHistory.getUserSearchHistory(
      userId,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: searchHistory,
      message: "Lấy lịch sử tìm kiếm thành công",
    });
  } catch (error) {
    console.error("Get user search history error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Lỗi khi lấy lịch sử tìm kiếm",
    });
  }
};

// Thêm hoặc cập nhật lịch sử tìm kiếm
exports.addSearchHistory = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const { keyword, searchType = "product", resultCount = 0 } = req.body;

    if (!userId || !keyword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID người dùng và từ khóa tìm kiếm",
      });
    }

    // Lấy IP address và user agent
    const ipAddress = req.ip || req.connection.remoteAddress || "";
    const userAgent = req.get("User-Agent") || "";

    const searchHistory = await SearchHistory.addOrUpdateSearch(
      userId,
      keyword.trim(),
      searchType,
      resultCount,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      data: searchHistory,
      message: "Đã lưu lịch sử tìm kiếm",
    });
  } catch (error) {
    console.error("Add search history error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Lỗi khi lưu lịch sử tìm kiếm",
    });
  }
};

// Xóa lịch sử tìm kiếm của user
exports.deleteSearchHistory = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const { keyword } = req.body; // Nếu có keyword thì xóa từ khóa cụ thể, không có thì xóa tất cả

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID người dùng",
      });
    }

    const result = await SearchHistory.deleteUserSearchHistory(userId, keyword);

    res.json({
      success: true,
      data: result,
      message: keyword 
        ? `Đã xóa lịch sử tìm kiếm "${keyword}"` 
        : "Đã xóa toàn bộ lịch sử tìm kiếm",
    });
  } catch (error) {
    console.error("Delete search history error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Lỗi khi xóa lịch sử tìm kiếm",
    });
  }
};

// Lấy gợi ý tìm kiếm dựa trên lịch sử và từ khóa phổ biến
exports.getSearchSuggestions = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const { keyword = "", limit = 5 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID người dùng",
      });
    }

    if (!keyword.trim()) {
      return res.json({
        success: true,
        data: [],
        message: "Vui lòng nhập từ khóa để nhận gợi ý",
      });
    }

    const suggestions = await SearchHistory.getSearchSuggestions(
      userId,
      keyword.trim(),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: suggestions,
      message: "Lấy gợi ý tìm kiếm thành công",
    });
  } catch (error) {
    console.error("Get search suggestions error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Lỗi khi lấy gợi ý tìm kiếm",
    });
  }
};

// Lấy thống kê tìm kiếm
exports.getSearchStats = async (req, res) => {
  try {
    const { timeRange = "all" } = req.query;
    
    // Tổng số lượt tìm kiếm
    const totalSearches = await SearchHistory.aggregate([
      {
        $group: {
          _id: null,
          total_searches: { $sum: "$search_count" },
          unique_keywords: { $addToSet: "$keyword" },
          unique_users: { $addToSet: "$user_id" },
        },
      },
      {
        $project: {
          total_searches: 1,
          unique_keywords_count: { $size: "$unique_keywords" },
          unique_users_count: { $size: "$unique_users" },
        },
      },
    ]);

    // Từ khóa phổ biến nhất
    const topKeywords = await SearchHistory.getPopularKeywords(5, timeRange);

    // Thống kê theo loại tìm kiếm
    const searchTypeStats = await SearchHistory.aggregate([
      {
        $group: {
          _id: "$search_type",
          count: { $sum: 1 },
          total_searches: { $sum: "$search_count" },
        },
      },
      {
        $project: {
          search_type: "$_id",
          count: 1,
          total_searches: 1,
        },
      },
    ]);

    // Thống kê theo thời gian (7 ngày gần nhất)
    const dailyStats = await SearchHistory.aggregate([
      {
        $match: {
          last_searched_at: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$last_searched_at" },
          },
          searches: { $sum: "$search_count" },
          unique_users: { $addToSet: "$user_id" },
        },
      },
      {
        $project: {
          date: "$_id",
          searches: 1,
          unique_users_count: { $size: "$unique_users" },
        },
      },
      { $sort: { date: 1 } },
    ]);

    const stats = {
      overview: totalSearches[0] || {
        total_searches: 0,
        unique_keywords_count: 0,
        unique_users_count: 0,
      },
      top_keywords: topKeywords,
      search_types: searchTypeStats,
      daily_stats: dailyStats,
    };

    res.json({
      success: true,
      data: stats,
      message: "Lấy thống kê tìm kiếm thành công",
    });
  } catch (error) {
    console.error("Get search stats error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Lỗi khi lấy thống kê tìm kiếm",
    });
  }
};

// Lấy lịch sử tìm kiếm gần đây (cho user cụ thể)
exports.getRecentSearches = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const { limit = 5 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID người dùng",
      });
    }

    const recentSearches = await SearchHistory.find({ user_id: userId })
      .sort({ last_searched_at: -1 })
      .limit(parseInt(limit))
      .select("keyword last_searched_at search_type result_count");

    res.json({
      success: true,
      data: recentSearches,
      message: "Lấy lịch sử tìm kiếm gần đây thành công",
    });
  } catch (error) {
    console.error("Get recent searches error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Lỗi khi lấy lịch sử tìm kiếm gần đây",
    });
  }
};

// Lấy từ khóa tìm kiếm phổ biến theo thời gian thực
exports.getRealTimePopularKeywords = async (req, res) => {
  try {
    const { limit = 10, hours = 24 } = req.query;
    
    const timeAgo = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);
    
    const realTimeKeywords = await SearchHistory.aggregate([
      {
        $match: {
          last_searched_at: { $gte: timeAgo },
        },
      },
      {
        $group: {
          _id: "$keyword",
          searches: { $sum: "$search_count" },
          unique_users: { $addToSet: "$user_id" },
          last_searched: { $max: "$last_searched_at" },
        },
      },
      {
        $addFields: {
          unique_user_count: { $size: "$unique_users" },
          trending_score: {
            $add: [
              { $multiply: ["$searches", 0.6] },
              { $multiply: ["$unique_user_count", 0.4] },
            ],
          },
        },
      },
      {
        $project: {
          keyword: "$_id",
          searches: 1,
          unique_user_count: 1,
          last_searched: 1,
          trending_score: 1,
        },
      },
      { $sort: { trending_score: -1, last_searched: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({
      success: true,
      data: realTimeKeywords,
      message: `Lấy từ khóa phổ biến trong ${hours} giờ gần đây thành công`,
    });
  } catch (error) {
    console.error("Get real-time popular keywords error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Lỗi khi lấy từ khóa phổ biến thời gian thực",
    });
  }
};