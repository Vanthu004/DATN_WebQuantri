const CartItem = require("../models/cartItem");

/* Thêm sản phẩm vào giỏ hàng */
exports.addItem = async (req, res) => {
  try {
    // Kiểm tra xem cart‑item đã tồn tại => cập nhật quantity
    const { cart_id, product_id, quantity } = req.body;
    let item = await CartItem.findOne({ cart_id, product_id });
    if (item) {
      item.quantity += quantity ?? 1;
      await item.save();
      return res.json(item);
    }

    // Nếu chưa có thì tạo mới
    item = await CartItem.create({ cart_id, product_id, quantity });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả item của 1 cart */
exports.getItemsByCart = async (req, res) => {
  try {
    const list = await CartItem.find({ cart_id: req.params.cartId })
      .populate("product_id", "name price")
      .populate("cart_id");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Cập nhật số lượng */
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0)
      return res.status(400).json({ msg: "Số lượng phải lớn hơn 0" });

    const updated = await CartItem.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Không tìm thấy item" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Xoá item */
exports.deleteItem = async (req, res) => {
  try {
    const deleted = await CartItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy item" });
    res.json({ msg: "Đã xoá item khỏi cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
