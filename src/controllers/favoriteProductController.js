const FavoriteProduct = require("../models/favoriteProduct");

/* Thêm sản phẩm yêu thích */
exports.addFavorite = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    const favorite = await FavoriteProduct.create({ user_id, product_id });
    res.status(201).json(favorite);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy danh sách sản phẩm yêu thích của user */
exports.getFavoritesByUser = async (req, res) => {
  try {
    const list = await FavoriteProduct.find({ user_id: req.params.userId })
      .populate("product_id"); // lấy chi tiết sản phẩm nếu cần
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Xoá sản phẩm yêu thích */
exports.removeFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const removed = await FavoriteProduct.findOneAndDelete({
      user_id: userId,
      product_id: productId,
    });
    if (!removed) return res.status(404).json({ msg: "Không tìm thấy sản phẩm yêu thích" });
    res.json({ msg: "Đã xoá khỏi yêu thích" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
