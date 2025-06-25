// src/controllers/productController.js
const Product = require("../models/product");

/* Tạo sản phẩm mới */
exports.createProduct = async (req, res) => {
  try {
    // Tìm product_id lớn nhất hiện tại
    const lastProduct = await Product.findOne({}).sort({ product_id: -1 });
    let nextId = 1;
    if (lastProduct && lastProduct.product_id) {
      const match = lastProduct.product_id.match(/P(\d{3})/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    const product_id = `P${nextId.toString().padStart(3, "0")}`;
    // Lưu ý: images là mảng ObjectId Upload, image_url là url cũ
    const { images, image_url, ...rest } = req.body;
    const product = await Product.create({
      ...rest,
      product_id,
      images: images || [],
      image_url: image_url || "",
    });
    const populated = await Product.findById(product._id).populate([
      "category_id",
      "images",
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả sản phẩm (chỉ lấy chưa bị xóa) */
exports.getAllProducts = async (req, res) => {
  const filter = req.query.showDeleted === "true" ? {} : { is_deleted: false };
  try {
    const list = await Product.find(filter).populate(["category_id", "images"]);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy sản phẩm theo ID */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate([
      "category_id",
      "images",
    ]);
    if (!product || product.is_deleted)
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy sản phẩm theo danh mục (chỉ lấy chưa bị xóa) */
exports.getProductsByCategory = async (req, res) => {
  try {
    const list = await Product.find({
      category_id: req.params.categoryId,
      is_deleted: false,
    }).populate(["category_id", "images"]);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Cập nhật sản phẩm */
exports.updateProduct = async (req, res) => {
  try {
    const { images, image_url, ...rest } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        images: images || [],
        image_url: image_url || "",
      },
      { new: true }
    ).populate(["category_id", "images"]);
    if (!updated || updated.is_deleted)
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Xoá mềm sản phẩm */
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndUpdate(
      req.params.id,
      { is_deleted: true },
      { new: true }
    );
    if (!deleted)
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    res.json({ msg: "Đã xoá (soft delete)", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
