const Review = require("../models/review");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

// ✅ Hàm tạo review mới
exports.createReview = async (req, res) => {
  try {
    const { user_id, product_id, rating, comment } = req.body;

    // Kiểm tra ID hợp lệ
    if (!ObjectId.isValid(user_id) || !ObjectId.isValid(product_id)) {
      return res.status(400).json({ message: "user_id hoặc product_id không hợp lệ" });
    }

    const review = new Review({
      user_id: new ObjectId(user_id),
      product_id: new ObjectId(product_id),
      rating,
      comment,
      create_date: new Date(),
    });

    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error("Lỗi khi tạo review:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Hàm lấy danh sách review (có populate tên và avatar user)
exports.getReviews = async (req, res) => {
  try {
    const filter = {};

    if (req.query.product_id) {
      const productId = req.query.product_id;

      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "product_id không hợp lệ" });
      }

      filter.product_id = new ObjectId(productId);
    }

    const reviews = await Review.find(filter)
      .sort({ create_date: -1 }) // Sắp xếp mới nhất lên đầu
      .populate("user_id", "name avata_url") // 👈 CHỈ lấy name và avatar (không lấy password)
      .populate("product_id", "name"); // Nếu cần tên sản phẩm

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách review:", error);
    res.status(500).json({ message: "Lỗi server khi lấy đánh giá" });
  }
};


// ✅ Lấy review theo ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user_id")
      .populate("product_id");

    if (!review) return res.status(404).json({ message: "Review không tồn tại" });

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Cập nhật review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        rating,
        comment,
        create_date: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!review) return res.status(404).json({ message: "Review không tồn tại" });

    res.status(200).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Xoá review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) return res.status(404).json({ message: "Review không tồn tại" });

    res.status(200).json({ message: "Xoá review thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
