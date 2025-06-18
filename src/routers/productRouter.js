const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const mongoose = require('mongoose');

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
});

// Lấy sản phẩm theo ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
});

// Thêm sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ!' });
  }
});

// Cập nhật sản phẩm
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: 'Cập nhật thất bại!' });
  }
});

// Xoá sản phẩm
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ message: 'Xóa thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
});
// Thêm dữ liệu mẫu (seed)
router.post('/seed', async (req, res) => {
  try {
    const fakeCategoryId = new mongoose.Types.ObjectId(); // giả lập ID Category
    const sampleProducts = [
      {
        product_id: 'P001',
        name: 'Quần jeans',
        description: 'Màu xanh',
        price: 150000,
        stock_quantity: 20,
        status: 'active',
        category_id: '666a59b8c8fb8c0c088ebcd7', 
        image_url: 'https://example.com/images/monstera.jpg',
        sold_quantity: 5
      },
      {
        product_id: 'P002',
        name: 'Áo phông nam',
        description: 'Màu trắng',
        price: 50000,
        stock_quantity: 100,
        status: 'active',
        category_id: '666a59b8c8fb8c0c088ebcd9',
        image_url: 'https://example.com/images/sendamix.jpg',
        sold_quantity: 35
      }
      
    ];

    await Product.insertMany(sampleProducts);
    res.status(201).json({ message: '✅ Đã thêm dữ liệu mẫu thành công!' });
  } catch (err) {
    console.error('❌ LỖI KHI SEED:', err);
    res.status(500).json({ error: 'Lỗi khi thêm dữ liệu mẫu', message: err.message });
  }
});


module.exports = router;
