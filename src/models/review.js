const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  create_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
