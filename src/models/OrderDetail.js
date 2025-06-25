const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariant",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price_each: {
    type: Number,
    required: true,
  },
   product_name: {
    type: String,
    required: true,
    trim: true
  },
});

module.exports = mongoose.model("OrderDetail", orderDetailSchema);
