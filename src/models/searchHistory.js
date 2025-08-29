const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    keyword: {
      type: String,
      required: true,
      trim: true,
    },
    search_count: {
      type: Number,
      default: 1,
    },
    last_searched_at: {
      type: Date,
      default: Date.now,
    },
    // Thêm trường để phân biệt loại tìm kiếm
    search_type: {
      type: String,
      enum: ["product", "category", "general"],
      default: "product",
    },
    // Lưu thêm thông tin về kết quả tìm kiếm
    result_count: {
      type: Number,
      default: 0,
    },
    // IP address để tracking (optional)
    ip_address: {
      type: String,
      default: "",
    },
    // User agent để tracking (optional)
    user_agent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index để tối ưu query
searchHistorySchema.index({ user_id: 1, keyword: 1 }, { unique: true });
searchHistorySchema.index({ user_id: 1, last_searched_at: -1 });
searchHistorySchema.index({ keyword: 1, search_count: -1 });
searchHistorySchema.index({ last_searched_at: -1 });

// Pre-save middleware để cập nhật search_count và last_searched_at
searchHistorySchema.pre("save", function (next) {
  if (this.isModified("keyword")) {
    this.last_searched_at = new Date();
  }
  next();
});

// Static method để lấy từ khóa phổ biến
searchHistorySchema.statics.getPopularKeywords = async function (limit = 10, timeRange = "all") {
  let dateFilter = {};
  const now = new Date();

  switch (timeRange) {
    case "today":
      dateFilter = { last_searched_at: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
      break;
    case "week":
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { last_searched_at: { $gte: weekAgo } };
      break;
    case "month":
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { last_searched_at: { $gte: monthAgo } };
      break;
    default:
      // 'all' - không filter theo thời gian
      break;
  }

  return this.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: "$keyword",
        total_searches: { $sum: "$search_count" },
        unique_users: { $addToSet: "$user_id" },
        last_searched: { $max: "$last_searched_at" },
        search_type: { $first: "$search_type" },
      },
    },
    {
      $addFields: {
        unique_user_count: { $size: "$unique_users" },
      },
    },
    {
      $project: {
        keyword: "$_id",
        total_searches: 1,
        unique_user_count: 1,
        last_searched: 1,
        search_type: 1,
        popularity_score: {
          $add: [
            { $multiply: ["$total_searches", 0.7] },
            { $multiply: ["$unique_user_count", 0.3] },
          ],
        },
      },
    },
    { $sort: { popularity_score: -1, total_searches: -1 } },
    { $limit: limit },
  ]);
};

// Static method để lấy lịch sử tìm kiếm của user
searchHistorySchema.statics.getUserSearchHistory = async function (userId, limit = 10) {
  return this.find({ user_id: userId })
    .sort({ last_searched_at: -1 })
    .limit(limit)
    .select("keyword search_count last_searched_at search_type result_count");
};

// Static method để thêm hoặc cập nhật lịch sử tìm kiếm
searchHistorySchema.statics.addOrUpdateSearch = async function (userId, keyword, searchType = "product", resultCount = 0, ipAddress = "", userAgent = "") {
  try {
    const existingSearch = await this.findOne({ user_id: userId, keyword: keyword });
    
    if (existingSearch) {
      // Cập nhật search count và thời gian
      existingSearch.search_count += 1;
      existingSearch.last_searched_at = new Date();
      existingSearch.result_count = resultCount;
      if (ipAddress) existingSearch.ip_address = ipAddress;
      if (userAgent) existingSearch.user_agent = userAgent;
      
      return await existingSearch.save();
    } else {
      // Tạo mới
      return await this.create({
        user_id: userId,
        keyword: keyword,
        search_type: searchType,
        result_count: resultCount,
        ip_address: ipAddress,
        user_agent: userAgent,
      });
    }
  } catch (error) {
    console.error("Error adding/updating search history:", error);
    throw error;
  }
};

// Static method để xóa lịch sử tìm kiếm của user
searchHistorySchema.statics.deleteUserSearchHistory = async function (userId, keyword = null) {
  try {
    if (keyword) {
      return await this.deleteOne({ user_id: userId, keyword: keyword });
    } else {
      return await this.deleteMany({ user_id: userId });
    }
  } catch (error) {
    console.error("Error deleting search history:", error);
    throw error;
  }
};

// Static method để lấy gợi ý tìm kiếm dựa trên lịch sử
searchHistorySchema.statics.getSearchSuggestions = async function (userId, partialKeyword, limit = 5) {
  try {
    // Tìm từ khóa trong lịch sử của user
    const userHistory = await this.find({
      user_id: userId,
      keyword: { $regex: partialKeyword, $options: "i" },
    })
      .sort({ last_searched_at: -1 })
      .limit(limit)
      .select("keyword search_count");

    // Tìm từ khóa phổ biến chung
    const popularKeywords = await this.aggregate([
      {
        $match: {
          keyword: { $regex: partialKeyword, $options: "i" },
        },
      },
      {
        $group: {
          _id: "$keyword",
          total_searches: { $sum: "$search_count" },
        },
      },
      { $sort: { total_searches: -1 } },
      { $limit: limit },
      {
        $project: {
          keyword: "$_id",
          total_searches: 1,
          source: "popular",
        },
      },
    ]);

    // Kết hợp và loại bỏ trùng lặp
    const userSuggestions = userHistory.map(item => ({
      keyword: item.keyword,
      total_searches: item.search_count,
      source: "history",
    }));

    const allSuggestions = [...userSuggestions, ...popularKeywords];
    const uniqueSuggestions = [];
    const seenKeywords = new Set();

    for (const suggestion of allSuggestions) {
      if (!seenKeywords.has(suggestion.keyword)) {
        seenKeywords.add(suggestion.keyword);
        uniqueSuggestions.push(suggestion);
      }
    }

    return uniqueSuggestions.slice(0, limit);
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return [];
  }
};

module.exports = mongoose.model("SearchHistory", searchHistorySchema);