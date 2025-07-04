const CategoryType = require('../models/categoryType');

// Lấy tất cả loại danh mục
exports.getAll = async (req, res) => {
  try {
    const types = await CategoryType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy loại danh mục theo id
exports.getById = async (req, res) => {
  try {
    const type = await CategoryType.findById(req.params.id);
    if (!type) return res.status(404).json({ message: 'Not found' });
    res.json(type);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Thêm loại danh mục
exports.create = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const exists = await CategoryType.findOne({ $or: [{ name }, { code }] });
    if (exists) return res.status(400).json({ error: 'Name or code already exists' });
    const type = await CategoryType.create({ name, code, description });
    res.status(201).json(type);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật loại danh mục
exports.update = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const type = await CategoryType.findByIdAndUpdate(
      req.params.id,
      { name, code, description },
      { new: true }
    );
    if (!type) return res.status(404).json({ message: 'Not found' });
    res.json(type);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa loại danh mục
exports.delete = async (req, res) => {
  try {
    const type = await CategoryType.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Đã xóa', type });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// API cho Expo app - lấy danh sách loại danh mục công khai
exports.getAllPublic = async (req, res) => {
  try {
    const types = await CategoryType.find().select('name code description');
    res.json({
      success: true,
      data: types,
      message: "Lấy danh sách loại danh mục thành công"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: "Lỗi khi lấy danh sách loại danh mục"
    });
  }
};

// API cho Expo app - lấy chi tiết loại danh mục theo code
exports.getOnePublicByCode = async (req, res) => {
  try {
    const type = await CategoryType.findOne({ code: req.params.code }).select('name code description');
    if (!type) return res.status(404).json({ success: false, message: 'Không tìm thấy loại danh mục' });
    res.json({ success: true, data: type });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

 