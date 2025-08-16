const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const replySchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  comment: { type: String, required: true },
  create_date: { type: Date, default: Date.now }
});

const reviewSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
   image_url: { type: String }, // ✅ thêm dòng này để lưu đường dẫn ảnh
  create_date: { type: Date, default: Date.now },
  replies: [replySchema] // ✅ thêm mảng replies
});

module.exports = mongoose.model("Review", reviewSchema);
