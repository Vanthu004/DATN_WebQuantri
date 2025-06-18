const Cart = require("../models/cart");

/* Tạo giỏ hàng mới (user -> cart rỗng) */
exports.createCart = async (req, res) => {
  try {
    const cart = await Cart.create({ user_id: req.body.user_id });
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả giỏ hàng */
exports.getAllCarts = async (_req, res) => {
  try {
    const list = await Cart.find().populate("user_id", "name email");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy giỏ hàng theo cart _id */
exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate(
      "user_id",
      "name email"
    );
    if (!cart) return res.status(404).json({ msg: "Không tìm thấy cart" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy giỏ hàng của một người dùng */
exports.getCartByUser = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.params.userId });
    if (!cart) return res.status(404).json({ msg: "User chưa có cart" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Xoá giỏ hàng */
exports.deleteCart = async (req, res) => {
  try {
    const deleted = await Cart.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy cart" });
    res.json({ msg: "Đã xoá cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
