require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// Routers
const orderApi = require("./src/routers/orderRoutes");
const userRouter = require('./src/routers/userRouter');
const productRouter = require('./src/routers/productRouter');
const categoryRouter = require('./src/routers/categoryRouter');
const reviewRoutes = require('./src/routers/reviewRoutes');
const paymentRoutes = require('./src/routers/paymentRoutes');
const productVariantApi = require("./src/routers/productVariantApi");
const cartApi = require("./src/routers/cartApi");
const cartItemApi = require("./src/routers/cartItemApi");
const orderDetailRouter = require("./src/routers/orderDetailRouter");
const orderStatusRouter = require("./src/routers/orderStatusHistoryRouter");
const shippingRouter = require("./src/routers/shippingMethodRouter");
const paymentRouter = require("./src/routers/paymentMethodRouter");

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
app.use('/', productRouter);  
app.use('/', categoryRouter);
app.use("/api/orders", orderApi);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/", productVariantApi);
app.use("/", cartApi);
app.use("/", cartItemApi);
app.use("/api/order-details", orderDetailRouter);
app.use("/",orderStatusRouter);
app.use("/",shippingRouter);
app.use(paymentRouter);
// Route gốc hiển thị toàn bộ giỏ hàng + sản phẩm

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB Atlas'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
