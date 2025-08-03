const SalesStatistics = require("../models/SalesStatistics");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Product = require("../models/product");

// Thống kê doanh thu theo thời gian
exports.getRevenueStatistics = async (req, res) => {
  try {
    const { type = "daily", start_date, end_date, limit = 30 } = req.query;
    
    let matchStage = {};
    
    // Xử lý filter theo thời gian
    if (start_date && end_date) {
      matchStage.createdAt = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }
    
    // Chỉ tính đơn hàng đã hoàn thành
    matchStage.status = { $in: ["Đã giao hàng", "Hoàn thành"] };
    matchStage.payment_status = "paid";
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format: type === "daily" ? "%Y-%m-%d" : 
                      type === "weekly" ? "%Y-%U" :
                      type === "monthly" ? "%Y-%m" : "%Y",
              date: "$createdAt"
            }
          },
          revenue: { $sum: "$total_price" },
          order_count: { $sum: 1 },
          product_sold_count: { $sum: "$total_quantity" }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: parseInt(limit) }
    ];
    
    const statistics = await Order.aggregate(pipeline);
    
    res.json({
      success: true,
      data: statistics,
      type,
      total_revenue: statistics.reduce((sum, item) => sum + item.revenue, 0),
      total_orders: statistics.reduce((sum, item) => sum + item.order_count, 0)
    });
    
  } catch (error) {
    console.error("Error getting revenue statistics:", error);
    res.status(500).json({
      success: false,
      msg: "Lỗi khi lấy thống kê doanh thu"
    });
  }
};

// Thống kê sản phẩm bán chạy
exports.getTopSellingProducts = async (req, res) => {
  try {
    const { 
      period = "all", 
      start_date, 
      end_date, 
      limit = 10,
      category_id 
    } = req.query;
    
    let matchStage = {};
    
    // Xử lý filter theo thời gian
    if (start_date && end_date) {
      matchStage["order.createdAt"] = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }
    
    // Filter theo danh mục
    if (category_id) {
      matchStage["product.category_id"] = new mongoose.Types.ObjectId(category_id);
    }
    
    // Chỉ tính đơn hàng đã hoàn thành
    matchStage["order.status"] = { $in: ["Đã giao hàng", "Hoàn thành"] };
    matchStage["order.payment_status"] = "paid";
    
    const pipeline = [
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order"
        }
      },
      { $unwind: "$order" },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $match: matchStage },
      {
        $group: {
          _id: "$product_id",
          product_name: { $first: "$product_name" },
          product_image: { $first: "$product_image" },
          category_name: { $first: "$product.category_id" },
          quantity_sold: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$price_each", "$quantity"] } },
          order_count: { $addToSet: "$order_id" }
        }
      },
      {
        $addFields: {
          order_count: { $size: "$order_count" }
        }
      },
      { $sort: { quantity_sold: -1 } },
      { $limit: parseInt(limit) }
    ];
    
    const topProducts = await OrderDetail.aggregate(pipeline);
    
    res.json({
      success: true,
      data: topProducts,
      period,
      total_products: topProducts.length
    });
    
  } catch (error) {
    console.error("Error getting top selling products:", error);
    res.status(500).json({
      success: false,
      msg: "Lỗi khi lấy thống kê sản phẩm bán chạy"
    });
  }
};

// Thống kê tổng quan dashboard
exports.getDashboardStatistics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    
    // Tính ngày bắt đầu dựa trên period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Thống kê doanh thu
    const revenueStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["Đã giao hàng", "Hoàn thành"] },
          payment_status: "paid"
        }
      },
      {
        $group: {
          _id: null,
          total_revenue: { $sum: "$total_price" },
          order_count: { $sum: 1 },
          avg_order_value: { $avg: "$total_price" }
        }
      }
    ]);
    
    // Thống kê sản phẩm bán chạy top 5
    const topProducts = await OrderDetail.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order"
        }
      },
      { $unwind: "$order" },
      {
        $match: {
          "order.createdAt": { $gte: startDate },
          "order.status": { $in: ["Đã giao hàng", "Hoàn thành"] },
          "order.payment_status": "paid"
        }
      },
      {
        $group: {
          _id: "$product_id",
          product_name: { $first: "$product_name" },
          product_image: { $first: "$product_image" },
          quantity_sold: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$price_each", "$quantity"] } }
        }
      },
      { $sort: { quantity_sold: -1 } },
      { $limit: 5 }
    ]);
    
    // Thống kê theo danh mục
    const categoryStats = await OrderDetail.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order"
        }
      },
      { $unwind: "$order" },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $match: {
          "order.createdAt": { $gte: startDate },
          "order.status": { $in: ["Đã giao hàng", "Hoàn thành"] },
          "order.payment_status": "paid"
        }
      },
      {
        $group: {
          _id: "$product.category_id",
          category_name: { $first: "$product.category_id" },
          quantity_sold: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$price_each", "$quantity"] } }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    
    // Thống kê theo trạng thái đơn hàng
    const orderStatusStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$status",
          order_count: { $sum: 1 },
          revenue: { $sum: "$total_price" }
        }
      }
    ]);
    
    // Thống kê khách hàng
    const customerStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["Đã giao hàng", "Hoàn thành"] },
          payment_status: "paid"
        }
      },
      {
        $group: {
          _id: null,
          total_customers: { $addToSet: "$customer_id" },
          total_revenue: { $sum: "$total_price" },
          total_orders: { $sum: 1 }
        }
      },
      {
        $addFields: {
          total_customers: { $size: "$total_customers" },
          average_order_value: { $divide: ["$total_revenue", "$total_orders"] }
        }
      }
    ]);
    
    const result = {
      period,
      revenue: revenueStats[0] || { total_revenue: 0, order_count: 0, avg_order_value: 0 },
      top_products: topProducts,
      category_stats: categoryStats,
      order_status_stats: orderStatusStats,
      customer_stats: customerStats[0] || { total_customers: 0, average_order_value: 0 }
    };
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error("Error getting dashboard statistics:", error);
    res.status(500).json({
      success: false,
      msg: "Lỗi khi lấy thống kê dashboard"
    });
  }
};

// Tạo thống kê theo ngày (cron job)
exports.generateDailyStatistics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Kiểm tra xem đã có thống kê cho ngày hôm nay chưa
    const existingStats = await SalesStatistics.findOne({
      type: "daily",
      date: today
    });
    
    if (existingStats) {
      return res.json({
        success: true,
        msg: "Thống kê cho ngày hôm nay đã tồn tại",
        data: existingStats
      });
    }
    
    // Tính thống kê doanh thu
    const revenueStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $in: ["Đã giao hàng", "Hoàn thành"] },
          payment_status: "paid"
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total_price" },
          order_count: { $sum: 1 },
          product_sold_count: { $sum: "$total_quantity" }
        }
      }
    ]);
    
    // Tính top sản phẩm bán chạy
    const topProducts = await OrderDetail.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order"
        }
      },
      { $unwind: "$order" },
      {
        $match: {
          "order.createdAt": { $gte: today, $lt: tomorrow },
          "order.status": { $in: ["Đã giao hàng", "Hoàn thành"] },
          "order.payment_status": "paid"
        }
      },
      {
        $group: {
          _id: "$product_id",
          product_name: { $first: "$product_name" },
          quantity_sold: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$price_each", "$quantity"] } }
        }
      },
      { $sort: { quantity_sold: -1 } },
      { $limit: 10 }
    ]);
    
    // Tạo thống kê mới
    const statistics = new SalesStatistics({
      type: "daily",
      date: today,
      revenue: revenueStats[0]?.revenue || 0,
      order_count: revenueStats[0]?.order_count || 0,
      product_sold_count: revenueStats[0]?.product_sold_count || 0,
      top_products: topProducts.map((product, index) => ({
        product_id: product._id,
        product_name: product.product_name,
        quantity_sold: product.quantity_sold,
        revenue: product.revenue,
        rank: index + 1
      })),
      is_processed: true
    });
    
    await statistics.save();
    
    res.json({
      success: true,
      msg: "Tạo thống kê ngày thành công",
      data: statistics
    });
    
  } catch (error) {
    console.error("Error generating daily statistics:", error);
    res.status(500).json({
      success: false,
      msg: "Lỗi khi tạo thống kê ngày"
    });
  }
};

// Lấy thống kê theo khoảng thời gian
exports.getStatisticsByDateRange = async (req, res) => {
  try {
    const { start_date, end_date, type = "daily" } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        msg: "Vui lòng cung cấp start_date và end_date"
      });
    }
    
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    // Lấy thống kê từ SalesStatistics nếu có
    const cachedStats = await SalesStatistics.find({
      type,
      date: { $gte: startDate, $lte: endDate },
      is_processed: true
    }).sort({ date: 1 });
    
    if (cachedStats.length > 0) {
      return res.json({
        success: true,
        data: cachedStats,
        source: "cached"
      });
    }
    
    // Nếu không có cache, tính toán real-time
    const matchStage = {
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ["Đã giao hàng", "Hoàn thành"] },
      payment_status: "paid"
    };
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format: type === "daily" ? "%Y-%m-%d" : 
                      type === "weekly" ? "%Y-%U" :
                      type === "monthly" ? "%Y-%m" : "%Y",
              date: "$createdAt"
            }
          },
          revenue: { $sum: "$total_price" },
          order_count: { $sum: 1 },
          product_sold_count: { $sum: "$total_quantity" }
        }
      },
      { $sort: { _id: 1 } }
    ];
    
    const statistics = await Order.aggregate(pipeline);
    
    res.json({
      success: true,
      data: statistics,
      source: "real-time"
    });
    
  } catch (error) {
    console.error("Error getting statistics by date range:", error);
    res.status(500).json({
      success: false,
      msg: "Lỗi khi lấy thống kê theo khoảng thời gian"
    });
  }
};

// Cập nhật thống kê sản phẩm khi có đơn hàng mới
exports.updateProductStatistics = async (orderId) => {
  try {
    const orderDetails = await OrderDetail.find({ order_id: orderId });
    
    for (const detail of orderDetails) {
      const product = await Product.findById(detail.product_id);
      if (product) {
        // Cập nhật số lượng bán
        product.sold_quantity += detail.quantity;
        
        // Cập nhật doanh thu
        product.revenue += detail.price_each * detail.quantity;
        
        // Cập nhật thời gian bán cuối
        product.last_sold_at = new Date();
        
        // Cập nhật thống kê theo thời gian
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);
        
        // Cập nhật daily stats
        if (!product.sales_stats.daily) product.sales_stats.daily = 0;
        product.sales_stats.daily += detail.quantity;
        
        // Cập nhật weekly stats
        if (!product.sales_stats.weekly) product.sales_stats.weekly = 0;
        product.sales_stats.weekly += detail.quantity;
        
        // Cập nhật monthly stats
        if (!product.sales_stats.monthly) product.sales_stats.monthly = 0;
        product.sales_stats.monthly += detail.quantity;
        
        // Cập nhật yearly stats
        if (!product.sales_stats.yearly) product.sales_stats.yearly = 0;
        product.sales_stats.yearly += detail.quantity;
        
        await product.save();
      }
    }
  } catch (error) {
    console.error("Error updating product statistics:", error);
  }
};

// Reset thống kê hàng ngày (cron job)
exports.resetDailyStats = async () => {
  try {
    const products = await Product.find({});
    
    for (const product of products) {
      product.sales_stats.daily = 0;
      await product.save();
    }
    
    console.log("Reset daily stats completed");
  } catch (error) {
    console.error("Error resetting daily stats:", error);
  }
};

// Reset thống kê hàng tuần (cron job)
exports.resetWeeklyStats = async () => {
  try {
    const products = await Product.find({});
    
    for (const product of products) {
      product.sales_stats.weekly = 0;
      await product.save();
    }
    
    console.log("Reset weekly stats completed");
  } catch (error) {
    console.error("Error resetting weekly stats:", error);
  }
};

// Reset thống kê hàng tháng (cron job)
exports.resetMonthlyStats = async () => {
  try {
    const products = await Product.find({});
    
    for (const product of products) {
      product.sales_stats.monthly = 0;
      await product.save();
    }
    
    console.log("Reset monthly stats completed");
  } catch (error) {
    console.error("Error resetting monthly stats:", error);
  }
};