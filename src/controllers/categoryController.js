
const Category = require("../models/category");
const Product = require("../models/product");


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


    // Nếu có đổi categoryType, cập nhật lại tất cả sản phẩm thuộc category này
    if (rest.categoryType) {
      await Product.updateMany(
        { category_id: cat._id },
        { $set: { updatedAt: new Date() } } // chỉ cập nhật updatedAt để trigger đồng bộ, không cần đổi gì khác
      );
    }

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


/* API cập nhật thứ tự sắp xếp nhiều danh mục */
exports.updateSortOrders = async (req, res) => {
  try {
    const { orders } = req.body; // [{ _id, sort_order }]
    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'orders must be an array' });
    }
    const bulkOps = orders.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: { sort_order: item.sort_order }
      }
    }));
    await Category.bulkWrite(bulkOps);
    res.json({ message: 'Cập nhật thứ tự thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả category theo categoryType */
exports.getCategoriesByCategoryType = async (req, res) => {
  try {
    const { categoryTypeId } = req.params;
    const categories = await Category.find({
      categoryType: categoryTypeId,
      is_deleted: false,
      status: 'active'
    }).populate('image');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

