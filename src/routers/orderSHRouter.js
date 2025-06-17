const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const OrderStatusHistory = require('../models/orderStatusHistory');

// Lấy toàn bộ lịch sử trạng thái đơn hàng
router.get('/', async (req, res) => {
  try {
    const history = await OrderStatusHistory.find();
 

    res.json(history);
  } catch (err) {
    console.error('❌ Lỗi khi lấy lịch sử:', err.message);
    res.status(500).json({ error: 'Lỗi server!', message: err.message });
  }
});



// Lấy theo order_id
router.get('/order/:orderId', async (req, res) => {
  try {
    const history = await OrderStatusHistory.find({ order_id: req.params.orderId })
      .populate('updated_by')
      .sort({ updated_at: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
});

// Thêm lịch sử trạng thái
router.post('/', async (req, res) => {
  try {
    const newHistory = new OrderStatusHistory(req.body);
    await newHistory.save();
    res.status(201).json(newHistory);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ!', message: err.message });
  }
});

// Thêm dữ liệu mẫu

router.post('/seed', async (req, res) => {
  try {
    const sampleData = [
      {
        order_id: new mongoose.Types.ObjectId(), // Thay bằng ID đơn hàng có thật nếu có
        status: 'pending',
        updated_by: new mongoose.Types.ObjectId()
      },
      {
        order_id: new mongoose.Types.ObjectId(),
        status: 'processing',
        updated_by: new mongoose.Types.ObjectId()
      },
      {
        order_id: new mongoose.Types.ObjectId(),
        status: 'shipped',
        updated_by: new mongoose.Types.ObjectId()
      }
    ];

    await OrderStatusHistory.insertMany(sampleData);
    res.status(201).json({ message: '✅ Đã thêm dữ liệu mẫu order status history!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi thêm dữ liệu mẫu', message: err.message });
  }
});


module.exports = router;
