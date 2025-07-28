const ProductVariant = require('../models/productVariant');

// Tạo 1 hoặc nhiều biến thể
exports.createVariant = async (req, res) => {
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body];

    // Lọc các bản ghi hợp lệ
    const filtered = data.filter(item =>
      item.product_id && item.sku && item.price && item.attributes
    );

    if (filtered.length === 0) {
      return res.status(400).json({ error: "No valid variant provided" });
    }

    const inserted = await ProductVariant.insertMany(filtered, { ordered: false });
    res.status(201).json(inserted);
  } catch (err) {
    console.error("Insert error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả biến thể của 1 sản phẩm
exports.getVariantsByProduct = async (req, res) => {
  try {
    const variants = await ProductVariant.find({ product_id: req.params.productId })
      .populate('attributes.size')
      .populate('attributes.color');
    res.json(variants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật biến thể
exports.updateVariant = async (req, res) => {
  try {
    const updated = await ProductVariant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xoá biến thể
exports.deleteVariant = async (req, res) => {
  try {
    await ProductVariant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
