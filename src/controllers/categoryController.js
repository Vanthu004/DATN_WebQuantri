const Category = require("../models/category");

/* Tạo danh mục mới */
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả danh mục */
exports.getAllCategories = async (_req, res) => {
  try {
    const list = await Category.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy danh mục theo ID */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: "Không tìm thấy danh mục" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Cập nhật danh mục */
exports.updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Không tìm thấy danh mục" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Xoá danh mục */
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy danh mục" });
    res.json({ msg: "Đã xoá danh mục" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
