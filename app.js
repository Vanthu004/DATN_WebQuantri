require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


// Khởi tạo app và PORT
const app = express();

const PORT = process.env.PORT || 3000;

// ====== Import Routers & Controllers ======
const userRouter = require("./src/routers/userRouter");
const productRouter = require("./src/routers/productRouter");
const categoryRouter = require("./src/routers/categoryRouter");
const orderApi = require("./src/routers/orderRoutes");
const orderDetailRouter = require("./src/routers/orderDetailRouter");
const orderStatusRouter = require("./src/routers/orderStatusHistoryRouter");
const reviewRoutes = require("./src/routers/reviewRoutes");
const paymentRoutes = require("./src/routers/paymentRoutes");
const paymentRouter = require("./src/routers/paymentMethodRouter");
const shippingRouter = require("./src/routers/shippingMethodRouter");
const productVariantApi = require("./src/routers/productVariantApi");
const cartApi = require("./src/routers/cartApi");
const cartItemApi = require("./src/routers/cartItemApi");
const statisticApi = require("./src/routers/statisticApi");
const favoriteRouter = require("./src/routers/favoriteProductRouter");
const authController = require('./src/controllers/authController');
const addressRouter = require("./src/routers/addressRouter");
const categoryTypeRouter = require("./src/routers/categoryTypeRouter");
const uploadRouter = require("./src/routers/uploadRouter");
const voucherRouter = require("./src/routers/voucherRoutes");
const notificationRouter = require("./src/routers/notificationRoutes");

// ====== Kiểm tra biến môi trường bắt buộc ======
if (!process.env.JWT_SECRET) {
  console.error("❌ Lỗi: JWT_SECRET không được định nghĩa trong file .env");
  process.exit(1);
}

// ====== Middleware chung ======
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // phục vụ ảnh static

// ====== Định nghĩa các ROUTE ======
app.use("/api/users", userRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use("/api/orders", orderApi);
app.use("/api/order-details", orderDetailRouter);
app.use("/api/order-status-history", orderStatusRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payment-methods", paymentRouter);
app.use("/api/shipping-methods", shippingRouter);
app.use("/api/product-variants", productVariantApi);
app.use("/api/carts", cartApi);
app.use("/api/cart-items", cartItemApi);
app.use("/api/statistics", statisticApi);
app.use("/api/favorites", favoriteRouter);
app.use("/api", uploadRouter);
app.use('/api/category-types', categoryTypeRouter);
app.use('/api/vouchers', voucherRouter);
app.use('/api/notifications', notificationRouter);
app.use("/api/addresses", addressRouter);

// ====== Auth routes (forgot/reset password) ======
app.post('/api/forgot-password', authController.forgotPassword);
app.post('/api/reset-password', authController.resetPassword);

// ====== Kết nối DATABASE ======
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB Atlas"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// ====== Middleware xử lý lỗi ======
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Lỗi server", error: err.message });
});

// ====== Khởi động SERVER ======
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
