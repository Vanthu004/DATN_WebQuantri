require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ======== IMPORT ROUTERS =========
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

const authController = require("./src/controllers/authController");
const uploadRouter = require("./src/routers/uploadRouter");

const app = express();
const PORT = process.env.PORT || 3000;

// Kiểm tra biến môi trường bắt buộc
if (!process.env.JWT_SECRET) {
  console.error("❌ Lỗi: JWT_SECRET không được định nghĩa trong file .env");
  process.exit(1);
}

// Middleware chung
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // phục vụ ảnh static

// ========== ROUTE ĐIỂM VÀO ==========

app.use("/api/users", userRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
// =======
// app.use("/", productRouter);
// app.use("/api/categories", categoryRouter);
// >>>>>>> 954a0f8b22b0dcf43e86c521e52465ee4686f224
app.use("/api/orders", orderApi);
app.use("/api/order-details", orderDetailRouter);
app.use("/api/order-status-history", orderStatusRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payment-methods", paymentRouter);
app.use("/api/shipping-methods", shippingRouter);
app.use("/api/product-variants", productVariantApi);
app.use("/", cartApi);
app.use("/", cartItemApi);
app.use("/api/order-details", orderDetailRouter);
app.use("/", orderStatusRouter);
app.use("/", shippingRouter);
app.use(paymentRouter);
app.use(favoriteRouter);


// Auth routes (forgot password)
app.post("/api/forgot-password", authController.forgotPassword);
app.post("/api/reset-password", authController.resetPassword);
app.use("/api", uploadRouter);
// Route gốc hiển thị toàn bộ giỏ hàng + sản phẩm

// ========== KẾT NỐI DATABASE ==========
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB Atlas"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// ========== MIDDLEWARE LỖI ==========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Lỗi server", error: err.message });
});

// ========== KHỞI ĐỘNG SERVER ==========
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
