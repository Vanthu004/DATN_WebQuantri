// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const userRouter = require('./src/routers/userRouter');
// require('dotenv').config();

// if (!process.env.JWT_SECRET) {
//   console.error('❌ Lỗi: JWT_SECRET không được định nghĩa trong file .env');
//   process.exit(1);
// }

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors({
//   origin: ['http://localhost:3000'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
// app.use(express.json());

// // Kết nối MongoDB Atlas
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log("✅ Đã kết nối MongoDB Atlas"))
//   .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));

// // Routes
// app.use("/api/users", userRouter);

// // Middleware xử lý lỗi
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Lỗi server', error: err.message });
// });

// // Chạy server
// app.listen(PORT, () => {
//   console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
// });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./src/routers/userRouter');
const cartRouter = require('./src/routers/cartRouter');

const Cart = require('./src/models/Cart');
const CartItem = require('./src/models/cartItem');
require('./src/models/product'); // để populate hoạt động

const cartController = require('./src/controllers/cartController'); // 👈 dùng cho route /

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB Atlas"))
  .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));

app.use("/api/users", userRouter);
app.use("/api/cart", cartRouter);

//
const productRouter = require('./src/routers/productRouter');
app.use("/api/products", productRouter);

// Route gốc hiển thị toàn bộ giỏ hàng + sản phẩm
app.get("/", cartController.getAllCartsWithItems);

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
