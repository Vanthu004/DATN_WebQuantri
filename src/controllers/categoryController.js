const Category = require("../models/Category");

/* Tạo danh mục */
exports.createCategory = async (req, res) => {
  try {
    const { image, image_url, ...rest } = req.body;
    const category = await Category.create({
      ...rest,
      image: image || null,
      image_url: image_url || "",
    });
    const populated = await Category.findById(category._id).populate("image");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy danh sách (mặc định bỏ category đã xoá) */
exports.getCategories = async (req, res) => {
  const filter = req.query.showDeleted === "true" ? {} : { is_deleted: false };
  try {
    const cats = await Category.find(filter)
      .sort({ sort_order: 1 })
      .populate("image");
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy chi tiết (ẩn category đã xoá) */
exports.getCategoryById = async (req, res) => {
  try {
    const cat = await Category.findOne({
      _id: req.params.id,
      is_deleted: false,
    }).populate("image");
    if (!cat) return res.status(404).json({ message: "Not found" });
    res.json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Cập nhật (chỉ cho phép với category chưa xoá) */
exports.updateCategory = async (req, res) => {
  try {
    const { image, image_url, ...rest } = req.body;
    const cat = await Category.findOneAndUpdate(
      { _id: req.params.id, is_deleted: false },
      {
        ...rest,
        image: image || null,
        image_url: image_url || "",
      },
      { new: true }
    ).populate("image");
    if (!cat) return res.status(404).json({ message: "Not found" });
    res.json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Soft‑delete */
exports.deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findOneAndUpdate(
      { _id: req.params.id, is_deleted: false },
      { is_deleted: true },
      { new: true }
    );
    if (!cat) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Đã xoá (soft delete)", cat });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
