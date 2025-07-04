const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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
      trim: true,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_image: { type: String },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("OrderDetail", orderDetailSchema);
