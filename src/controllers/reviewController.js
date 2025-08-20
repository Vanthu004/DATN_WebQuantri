const Review = require("../models/review");
const User = require("../models/user");
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

    const imageUrls = [];
    if (req.files && req.files.images && Array.isArray(req.files.images)) {
      for (const file of req.files.images) {
        imageUrls.push(`${req.protocol}://${req.get("host")}/uploads/reviews/${file.filename}`);
      }
    } else if (req.files && req.files.image && Array.isArray(req.files.image) && req.files.image.length > 0) {
      imageUrls.push(`${req.protocol}://${req.get("host")}/uploads/reviews/${req.files.image[0].filename}`);
    } else if (req.file) {
      imageUrls.push(`${req.protocol}://${req.get("host")}/uploads/reviews/${req.file.filename}`);
    }

    // Validate rating range (1-5)
    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "rating phải từ 1 đến 5" });
    }

    const review = new Review({
      user_id: new ObjectId(user_id),
      product_id: new ObjectId(product_id),
      rating: numericRating,
      comment,
      image_urls: imageUrls,
      create_date: new Date(),
    });

    const savedReview = await review.save();

    const populatedReview = await Review.findById(savedReview._id)
      .populate({ path: "user_id", select: "name avata_url role" })
      .populate({ path: "product_id", select: "name image_url" })
      .populate({ path: "replies.user_id", select: "name avata_url role" });

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
      .populate({ path: "user_id", select: "name avata_url role" })
      .populate({ path: "product_id", select: "name image_url" })
      .populate({ path: "replies.user_id", select: "name avata_url role" });

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
      .populate({ path: "user_id", select: "name avata_url role" })
      .populate({ path: "product_id", select: "name image_url" })
      .populate({ path: "replies.user_id", select: "name avata_url role" });

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
      .populate({ path: "user_id", select: "name avata_url role" })
      .populate({ path: "product_id", select: "name image_url" })
      .populate({ path: "replies.user_id", select: "name avata_url role" });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Lỗi khi lấy review theo user_id:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Lấy tất cả review theo product_id
exports.getReviewsByProductId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "product_id không hợp lệ" });
    }

    const reviews = await Review.find({ product_id: new ObjectId(id) })
      .sort({ create_date: -1 })
      .populate({ path: "user_id", select: "name avata_url role" })
      .populate({ path: "product_id", select: "name image_url" })
      .populate({ path: "replies.user_id", select: "name avata_url role" });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Lỗi khi lấy review theo product_id:", error);
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
      .populate({ path: "user_id", select: "name avata_url role" })
      .populate({ path: "product_id", select: "name image_url" })
      .populate({ path: "replies.user_id", select: "name avata_url role" });

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

// ✅ Thêm reply vào review (tự lấy admin nếu không gửi user_id)
exports.addReply = async (req, res) => {
  try {
    const { id } = req.params;
    let { user_id, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID review không hợp lệ" });
    }

    // 🔹 Nếu không gửi user_id thì dùng admin
    if (!user_id) {
      const adminUser = await User.findOne({ role: "admin" });
      if (!adminUser) {
        return res.status(404).json({ message: "Không tìm thấy admin" });
      }
      user_id = adminUser._id;
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "user_id không hợp lệ" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    review.replies.push({
      user_id: new mongoose.Types.ObjectId(user_id),
      comment,
      create_date: new Date()
    });

    await review.save();

    const populatedReview = await Review.findById(id)
      .populate({ path: "user_id", select: "name avata_url role" })
      .populate({ path: "product_id", select: "name image_url" })
      .populate({ path: "replies.user_id", select: "name avata_url role" });

    res.status(200).json(populatedReview);
  } catch (error) {
    console.error("Lỗi khi thêm reply:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Xóa reply
exports.deleteReply = async (req, res) => {
  try {
    const { id, replyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(replyId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    review.replies = review.replies.filter(r => r._id.toString() !== replyId);
    await review.save();

    res.status(200).json({ message: "Xóa reply thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa reply:", error);
    res.status(500).json({ message: error.message });
  }
};
