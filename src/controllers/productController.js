// src/controllers/productController.js
const Product = require("../models/product");

/* Tạo sản phẩm mới */
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả sản phẩm */
exports.getAllProducts = async (_req, res) => {
  try {
    const list = await Product.find().populate("category_id", "name");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy sản phẩm theo ID */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category_id",
      "name"
    );
    if (!product) return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy sản phẩm theo danh mục */
exports.getProductsByCategory = async (req, res) => {
  try {
    const list = await Product.find({ category_id: req.params.categoryId });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Cập nhật sản phẩm */
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Xoá sản phẩm */
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    res.json({ msg: "Đã xoá sản phẩm" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
