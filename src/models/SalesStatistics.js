const mongoose = require("mongoose");

const salesStatisticsSchema = new mongoose.Schema(
  {
    // Loại thống kê
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", "custom"],
      required: true
    },
    
    // Thời gian thống kê
    date: {
      type: Date,
      required: true
    },
    
    // Thông tin doanh thu
    revenue: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Số lượng đơn hàng
    order_count: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Số lượng sản phẩm bán ra
    product_sold_count: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Danh sách sản phẩm bán chạy (top 10)
    top_products: [{
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      product_name: String,
      quantity_sold: Number,
      revenue: Number,
      rank: Number
    }],
    
    // Thống kê theo danh mục
    category_stats: [{
      category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      },
      category_name: String,
      quantity_sold: Number,
      revenue: Number
    }],
    
    // Thống kê theo phương thức thanh toán
    payment_method_stats: [{
      payment_method_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentMethod"
      },
      payment_method_name: String,
      order_count: Number,
      revenue: Number
    }],
    
    // Thống kê theo trạng thái đơn hàng
    order_status_stats: [{
      status: String,
      order_count: Number,
      revenue: Number
    }],
    
    // Metadata
    metadata: {
      total_customers: { type: Number, default: 0 },
      average_order_value: { type: Number, default: 0 },
      new_customers: { type: Number, default: 0 },
      returning_customers: { type: Number, default: 0 }
    },
    
    // Trạng thái
    is_processed: {
      type: Boolean,
      default: false
    },
    
    // Ghi chú
    notes: {
      type: String,
      trim: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field để tính tỷ lệ tăng trưởng
salesStatisticsSchema.virtual('growth_rate').get(function() {
  // Sẽ được tính khi so sánh với kỳ trước
  return 0;
});

// Virtual field để format date
salesStatisticsSchema.virtual('date_formatted').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Index để tối ưu query
salesStatisticsSchema.index({ type: 1, date: 1 });
salesStatisticsSchema.index({ date: -1 });
salesStatisticsSchema.index({ is_processed: 1 });

// Compound index cho query theo loại và thời gian
salesStatisticsSchema.index({ type: 1, date: -1 });

module.exports = mongoose.model("SalesStatistics", salesStatisticsSchema); 