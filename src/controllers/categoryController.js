const Category = require('../models/Category');

/* Tạo danh mục */
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy danh sách (mặc định bỏ category đã xoá) */
exports.getCategories = async (req, res) => {
  const filter = req.query.showDeleted === 'true' ? {} : { is_deleted: false };
  try {
    const cats = await Category.find(filter).sort({ sort_order: 1 });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy chi tiết */
exports.getCategoryById = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Not found' });
    res.json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Cập nhật */
exports.updateCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!cat) return res.status(404).json({ message: 'Not found' });
    res.json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Soft‑delete */
exports.deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      { is_deleted: true },
      { new: true }
    );
    if (!cat) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Đã xoá (soft delete)', cat });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
