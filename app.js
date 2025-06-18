require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Routers
const orderRoutes = require('./src/routers/orderRoutes');
const methodRouter = require('./src/routers/methodRouter');
const userRouter = require('./src/routers/userRouter');
const productRouter = require('./src/routers/productRouter');
const categoryRouter = require('./src/routers/categoryRouter');
const orderSHRouter = require('./src/routers/orderSHRouter');
const reviewRoutes = require('./src/routers/reviewRoutes');
const paymentRoutes = require('./src/routers/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Kiểm tra biến môi trường bắt buộc
if (!process.env.JWT_SECRET) {
  console.error('❌ Lỗi: JWT_SECRET không được định nghĩa trong file .env');
  process.exit(1);
}

// Middleware chung
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/orders', orderRoutes);
app.use('/api/orderSH', orderSHRouter);
app.use('/api/methods', methodRouter);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi server', error: err.message });
});

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB Atlas'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
