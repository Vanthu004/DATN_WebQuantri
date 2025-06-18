const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const mongoose = require('mongoose');

// Lấy tất cả danh mục
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
});

// Lấy danh mục theo ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
});

// Thêm danh mục mới
router.post('/', async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ!', message: err.message });
  }
});

// Cập nhật danh mục
router.put('/:id', async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Cập nhật thất bại!' });
  }
});

// Xóa danh mục
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json({ message: 'Xóa thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
});

// Thêm dữ liệu mẫu
router.post('/seed', async (req, res) => {
  try {
    const sampleCategories = [
      { name: 'Áo', status: 'active' },
      { name: 'Quần', status: 'active' },
      { name: 'Giày', status: 'active' }
    ];

    await Category.insertMany(sampleCategories);
    res.status(201).json({ message: '✅ Đã thêm dữ liệu mẫu danh mục!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi seed danh mục', message: err.message });
  }
});

module.exports = router;
