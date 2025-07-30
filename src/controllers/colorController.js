const Color = require('../models/Color');

// Tạo color mới
exports.createColor = async (req, res) => {
  try {
    const color = new Color(req.body);
    await color.save();
    res.status(201).json(color);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Lấy tất cả color (có thể lọc theo trạng thái/xóa)
exports.getAllColors = async (req, res) => {
  try {
    const { showDeleted } = req.query;
    const filter = {};
    if (showDeleted === 'true') filter.is_deleted = true;
    else if (showDeleted === 'false') filter.is_deleted = false;
    const colors = await Color.find(filter).sort({ createdAt: -1 });
    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy color theo id
exports.getColorById = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) return res.status(404).json({ error: 'Color not found' });
    res.json(color);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật color
exports.updateColor = async (req, res) => {
  try {
    const color = await Color.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!color) return res.status(404).json({ error: 'Color not found' });
    res.json(color);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Xóa mềm color
exports.softDeleteColor = async (req, res) => {
  try {
    const color = await Color.findByIdAndUpdate(req.params.id, { is_deleted: true }, { new: true });
    if (!color) return res.status(404).json({ error: 'Color not found' });
    res.json({ message: 'Color deleted (soft)', color });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Khôi phục color đã xóa mềm
exports.restoreColor = async (req, res) => {
  try {
    const color = await Color.findByIdAndUpdate(req.params.id, { is_deleted: false }, { new: true });
    if (!color) return res.status(404).json({ error: 'Color not found' });
    res.json({ message: 'Color restored', color });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
