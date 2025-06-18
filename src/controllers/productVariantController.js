// src/controllers/productVariantController.js
const ProductVariant = require("../models/productVariant");

/* Tạo mới biến thể */
exports.createVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.create(req.body);
    res.status(201).json(variant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả biến thể */
exports.getAllVariants = async (_req, res) => {
  try {
    const list = await ProductVariant.find().populate("product_id", "name");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy biến thể theo ID */
exports.getVariantById = async (req, res) => {
  try {
    const variant = await ProductVariant.findById(req.params.id).populate(
      "product_id",
      "name"
    );
    if (!variant) return res.status(404).json({ msg: "Không tìm thấy biến thể" });
    res.json(variant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy tất cả biến thể của 1 sản phẩm */
exports.getVariantsByProduct = async (req, res) => {
  try {
    const list = await ProductVariant.find({ product_id: req.params.productId });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Cập nhật biến thể */
exports.updateVariant = async (req, res) => {
  try {
    const updated = await ProductVariant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Không tìm thấy biến thể" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Xoá biến thể */
exports.deleteVariant = async (req, res) => {
  try {
    const deleted = await ProductVariant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy biến thể" });
    res.json({ msg: "Đã xoá biến thể" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
    