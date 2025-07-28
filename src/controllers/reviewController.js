const Review = require("../models/review");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

// ✅ Tạo review mới
exports.createReview = async (req, res) => {
  try {
    const { user_id, product_id, rating, comment } = req.body;

    if (!ObjectId.isValid(user_id) || !ObjectId.isValid(product_id)) {
      return res.status(400).json({ message: "user_id hoặc product_id không hợp lệ" });
    }

    const existing = await Review.findOne({
      user_id: new ObjectId(user_id),
      product_id: new ObjectId(product_id),
    });

    if (existing) {
      return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi." });
    }

    const review = new Review({
      user_id: new ObjectId(user_id),
      product_id: new ObjectId(product_id),
      rating,
      comment,
      create_date: new Date(),
    });

    const savedReview = await review.save();

    const populatedReview = await Review.findById(savedReview._id)
      .populate({ path: "user_id", select: "name avata_url" })
      .populate({ path: "product_id", select: "name image_url" });

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Lỗi khi tạo review:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Lấy tất cả review hoặc theo product_id
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
      .sort({ create_date: -1 })
      .populate({ path: "user_id", select: "name avata_url" })
      .populate({ path: "product_id", select: "name image_url" });

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
      .populate({ path: "user_id", select: "name avata_url" })
      .populate({ path: "product_id", select: "name image_url" });

    if (!review) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Lấy tất cả review theo user_id
exports.getReviewsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "user_id không hợp lệ" });
    }

    const reviews = await Review.find({ user_id: new ObjectId(user_id) })
      .sort({ create_date: -1 })
      .populate({ path: "user_id", select: "name avata_url" })
      .populate({ path: "product_id", select: "name image_url" });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Lỗi khi lấy review theo user_id:", error);
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
      { rating, comment, create_date: new Date() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    const populatedReview = await Review.findById(updated._id)
      .populate({ path: "user_id", select: "name avata_url" })
      .populate({ path: "product_id", select: "name image_url" });

    res.status(200).json(populatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Xóa review
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
