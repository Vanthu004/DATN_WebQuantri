const Review = require("../models/review");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

// ✅ Tạo review mới
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

    // Trả lại bản ghi sau khi populate để client nhận đủ thông tin
    const populatedReview = await Review.findById(savedReview._id)
      .populate("user_id", "name avata_url")
      .populate("product_id", "name");

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Lỗi khi tạo review:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Lấy danh sách review (theo product_id nếu có)
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
      .sort({ create_date: -1 }) // Sắp xếp mới nhất trước
      .populate("user_id", "name avata_url")
      .populate("product_id", "name");

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách review:", error);
    res.status(500).json({ message: "Lỗi server khi lấy đánh giá" });
  }
};

// ✅ Lấy review theo ID
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const review = await Review.findById(id)
      .populate("user_id", "name avata_url")
      .populate("product_id", "name");

    if (!review) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Cập nhật review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const updated = await Review.findByIdAndUpdate(
      id,
      {
        rating,
        comment,
        create_date: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate("user_id", "name avata_url")
      .populate("product_id", "name");

    if (!updated) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Xoá review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const deleted = await Review.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    res.status(200).json({ message: "Xoá review thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
