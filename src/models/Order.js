const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Loại bỏ trường products vì không sử dụng
    status: {
      type: String,
      enum: [
        "Chờ xử lý",
        "Đã xác nhận",
        "Đang vận chuyển",
        "Đã giao hàng",
        "Hoàn thành",
        "Đã hủy",
      ],
      default: "Chờ xử lý",
    },
    total_price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(v) {
          return v >= 0;
        },
        message: 'Tổng tiền phải lớn hơn hoặc bằng 0'
      }
    },
    shippingmethod_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingMethod",
      required: true,
    },
    paymentmethod_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    voucher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },
    is_paid: {
      type: Boolean,
      default: false,
    },
    shipping_address: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Địa chỉ giao hàng phải có ít nhất 10 ký tự']
    },
    order_code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    note: { 
      type: String, 
      trim: true,
      maxlength: [500, 'Ghi chú không được quá 500 ký tự']
    },
    // Thông tin bổ sung
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    shipping_status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "returned"],
      default: "pending"
    },
    // Thời gian xử lý
    confirmed_at: {
      type: Date
    },
    shipped_at: {
      type: Date
    },
    delivered_at: {
      type: Date
    },
    cancelled_at: {
      type: Date
    },
    cancel_reason: { 
      type: String, 
      default: null,
      maxlength: [200, 'Lý do hủy không được quá 200 ký tự']
    },

  },
  { 
    versionKey: false, 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field để lấy số lượng items trong đơn hàng
orderSchema.virtual('item_count').get(function() {
  // Sẽ được populate từ OrderDetail
  return this.order_details ? this.order_details.length : 0;
});

// Virtual field để tính tổng số lượng sản phẩm
orderSchema.virtual('total_quantity').get(function() {
  if (!this.order_details) return 0;
  return this.order_details.reduce((total, detail) => {
    return total + (detail.quantity || 0);
  }, 0);
});

// Virtual field để kiểm tra đơn hàng có biến thể không
orderSchema.virtual('has_variants').get(function() {
  if (!this.order_details) return false;
  return this.order_details.some(detail => detail.product_variant_id);
});

// Virtual field để lấy trạng thái hiển thị
orderSchema.virtual('status_display').get(function() {
  const statusMap = {
    "Chờ xử lý": "pending",
    "Đã xác nhận": "confirmed", 
    "Đang vận chuyển": "shipping",
    "Đã giao hàng": "delivered",
    "Hoàn thành": "completed",
    "Đã hủy": "cancelled"
  };
  return statusMap[this.status] || this.status;
});

// Index để tối ưu query
orderSchema.index({ user_id: 1, status: 1 });
orderSchema.index({ status: 1, created_at: -1 });
orderSchema.index({ payment_status: 1 });
orderSchema.index({ shipping_status: 1 });

module.exports = mongoose.model("Order", orderSchema);
