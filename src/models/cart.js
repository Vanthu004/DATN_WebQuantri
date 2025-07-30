const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  // Trạng thái giỏ hàng
  status: {
    type: String,
    enum: ["active", "converted", "abandoned"],
    default: "active"
  },
  // Ghi chú cho giỏ hàng
  note: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field để lấy số lượng items trong giỏ
cartSchema.virtual('item_count').get(function() {
  // Sẽ được populate từ CartItem
  return this.items ? this.items.length : 0;
});

// Virtual field để tính tổng tiền giỏ hàng
cartSchema.virtual('total_amount').get(function() {
  if (!this.items) return 0;
  return this.items.reduce((total, item) => {
    return total + (item.total_price || (item.price_at_time * item.quantity));
  }, 0);
});

// Index để tối ưu query
cartSchema.index({ user_id: 1, status: 1 });
cartSchema.index({ created_at: -1 });

module.exports = mongoose.model("Cart", cartSchema);
