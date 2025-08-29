const Size = require('../models/Size');

// Tạo size mới
exports.createSize = async (req, res) => {
  try {
    const size = new Size(req.body);
    await size.save();
    res.status(201).json(size);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Lấy tất cả size (có thể lọc theo trạng thái/xóa)
exports.getAllSizes = async (req, res) => {
  try {
    const { showDeleted } = req.query;
    const filter = {};
    if (showDeleted === 'true') filter.is_deleted = true;
    else if (showDeleted === 'false') filter.is_deleted = false;
    const sizes = await Size.find(filter).sort({ createdAt: -1 });
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy size theo id
exports.getSizeById = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    if (!size) return res.status(404).json({ error: 'Size not found' });
    res.json(size);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật size
exports.updateSize = async (req, res) => {
  try {
    const size = await Size.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!size) return res.status(404).json({ error: 'Size not found' });
    res.json(size);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Xóa mềm size
exports.softDeleteSize = async (req, res) => {
  try {
    const size = await Size.findByIdAndUpdate(req.params.id, { is_deleted: true }, { new: true });
    if (!size) return res.status(404).json({ error: 'Size not found' });
    res.json({ message: 'Size deleted (soft)', size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Khôi phục size đã xóa mềm
exports.restoreSize = async (req, res) => {
  try {
    const size = await Size.findByIdAndUpdate(req.params.id, { is_deleted: false }, { new: true });
    if (!size) return res.status(404).json({ error: 'Size not found' });
    res.json({ message: 'Size restored', size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
