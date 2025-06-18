const mongoose = require("mongoose");

const statisticSchema = new mongoose.Schema({
  // Nếu muốn tự sinh ID của MongoDB thì bỏ tk_id, hoặc để thành alias
  tk_id: {
    type: String,
    required: true,
    unique: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  total_sold: {
    type: Number,
    default: 0,
    min: 0,
  },
  cost_of_goods: {
    type: Number,
    default: 0,
    min: 0,
  },
  profit: {
    type: Number,
    default: 0,
    min: 0,
  },
  report_date: {
    type: Date,
    required: true,
  },
});

// (tuỳ chọn) tự động tính profit khi lưu
statisticSchema.pre("save", function (next) {
  if (this.isModified("total_sold") || this.isModified("cost_of_goods")) {
    this.profit = this.total_sold - this.cost_of_goods;
  }
  next();
});

module.exports = mongoose.model("Statistic", statisticSchema);
