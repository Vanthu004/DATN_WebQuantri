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
  product_variant_id: { type: Schema.Types.ObjectId, ref: "ProductVariant" }, // ✅ Thêm field này
  order_id: { type: String, required: true }, // ✅ Bắt buộc phải có order_id
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  image_urls: [{ type: String }],
  create_date: { type: Date, default: Date.now },
  replies: [replySchema] // ✅ thêm mảng replies
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual để tương thích ngược với trường đơn ảnh cũ
reviewSchema.virtual('image_url').get(function () {
  if (Array.isArray(this.image_urls) && this.image_urls.length > 0) {
    return this.image_urls[0];
  }
  return '';
});

module.exports = mongoose.model("Review", reviewSchema);
