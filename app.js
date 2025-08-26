require("dotenv").config();

// kiểm tra cấu hình
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const admin = require('firebase-admin');

// Khởi tạo app và server
const app = express();
const path = require("path");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép tất cả origin, có thể giới hạn sau
    methods: ["GET", "POST"],
  },
});
// Lưu io vào app để sử dụng trong controllers
app.set("io", io);
// ====== Import Routers & Controllers ======
const userRouter = require("./src/routers/userRouter");
const productRouter = require("./src/routers/productRouter");
const categoryRouter = require("./src/routers/categoryRouter");
const orderRouter = require("./src/routers/orderRoutes");
const orderDetailRouter = require("./src/routers/orderDetailRouter");
const orderStatusRouter = require("./src/routers/orderStatusHistoryRouter");
const reviewRouter = require("./src/routers/reviewRoutes");
const paymentRouter = require("./src/routers/paymentRoutes");
const paymentMethodRouter = require("./src/routers/paymentMethodRouter");
const shippingMethodRouter = require("./src/routers/shippingMethodRouter");
const productVariantRouter = require("./src/routers/productVariantApi");
const cartRouter = require("./src/routers/cartApi");
const cartItemRouter = require("./src/routers/cartItemApi");
const statisticRouter = require("./src/routers/statisticApi");
const salesStatisticsRouter = require("./src/routers/salesStatisticsRouter");
const favoriteRouter = require("./src/routers/favoriteProductRouter");
const authController = require("./src/controllers/authController");
const addressRouter = require("./src/routers/addressRouter");
const categoryTypeRouter = require("./src/routers/categoryTypeRouter");
const uploadRouter = require("./src/routers/uploadRouter");
const voucherRouter = require("./src/routers/voucherRoutes");
const notificationRouter = require("./src/routers/notificationRoutes");
const refundRouter = require("./src/routers/refundRequestRoutes");
const sizeRouter = require("./src/routers/sizeRouter");
const colorRouter = require("./src/routers/colorRouter");
const searchHistoryRouter = require("./src/routers/searchHistoryRouter");

const shiperRouter = require("./src/routers/shiperRouter");
const adminShiperRouter = require("./src/routers/adminShiperRouter");
const chatRoutes = require("./src/routers/chatRoutes.js");
const chatSocketHandler = require("./src/sockets/chatSocket");
const { chatNamespace } = chatSocketHandler(io);
const notificationRouter = require('./src/routers/notificationRoutes');
// ====== Kiểm tra biến môi trường bắt buộc ======
if (!process.env.JWT_SECRET) {
  console.error("❌ Lỗi: JWT_SECRET không được định nghĩa trong file .env");
  process.exit(1);
}
// ====== Middleware chung ======
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====== Định nghĩa các ROUTE ======
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/order-details", orderDetailRouter);
app.use("/api/order-status-history", orderStatusRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/payment-methods", paymentMethodRouter);
app.use("/api/shipping-methods", shippingMethodRouter);
app.use("/api/product-variants", productVariantRouter);
app.use("/api/cart", cartRouter);
app.use("/api/cart-items", cartItemRouter);
app.use("/api/statistics", statisticRouter);
app.use("/api/sales-statistics", salesStatisticsRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/sizes", sizeRouter);
app.use("/api/colors", colorRouter);
app.use("/api/shipers", shiperRouter);
app.use("/api/admin/shipers", adminShiperRouter);
app.use("/api/vouchers", voucherRouter);
// app.use("/api/uploads", uploadRouter);

app.use("/api/category-types", categoryTypeRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/refund-requests", refundRouter);
app.use("/api", uploadRouter);
app.use("/api/search-history", searchHistoryRouter);
app.use('/api/chat', chatRoutes);
app.set('chatNamespace', chatNamespace);
app.use('/api/notifications', notificationRouter);
// ====== Auth routes (forgot/reset password) ======
app.post("/api/forgot-password", authController.forgotPassword);
app.post("/api/reset-password", authController.resetPassword);

// ====== WebSocket xử lý kết nối ======
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined`);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ====== Kết nối MongoDB ======
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Đã kết nối MongoDB Atlas");

    // Khởi động cron jobs cho thống kê doanh thu
    try {
      const { startCronJobs } = require("./src/cron/salesStatisticsCron");
      startCronJobs();
      console.log("✅ Đã khởi động cron jobs thống kê doanh thu");
    } catch (error) {
      console.error("❌ Lỗi khởi động cron jobs:", error);
    }
  })
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));
// ====== Middleware xử lý lỗi ======
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Lỗi server", error: err.message });
});

// Khởi tạo Firebase Admin SDK
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});
// ====== Khởi động SERVER ======
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

module.exports = app;
