// src/routers/userRouter.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/auth");
const authController = require("../controllers/authController");
const upload = require("../middlewares/uploadMiddleware");

// Supabase routes
router.get("/supabase-token", protect, userController.getSupabaseToken);

// Public routes
router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/send-verification-email", authController.sendVerificationEmail);
router.post("/verify-email", authController.verifyEmail);

// Protected routes with specific names (must come before parameterized routes)
router.get("/me", protect, userController.getCurrentUser);
router.put("/update-profile", protect, userController.updateProfile);
router.put("/update-avatar", protect, userController.updateAvatar);
router.put("/change-password", protect, userController.changePassword);

//lấy danh sách user
router.get(
  "/roleUser",
  protect,
  restrictTo("admin"),
  userController.getAllUsersByRole
);

// Protected routes (yêu cầu xác thực)
router.get("/", protect, restrictTo("admin"), userController.getAllUsers);
router.get("/all", protect, restrictTo("admin"), userController.getAllUsers);
// Routes cho thống kê khách hàng (đặt trước routes có :id để tránh conflict)
router.get(
  "/statistics",
  protect,
  restrictTo("admin", "staff"),
  userController.getCustomerStatistics
);
router.get(
  "/top-customers",
  protect,
  restrictTo("admin", "staff"),
  userController.getTopCustomers
);
router.get("/avatar/:id", userController.getAvatar);

router.get("/:id", protect, restrictTo("admin"), userController.getUserById);
router.put("/:id", protect, restrictTo("admin"), userController.updateUser);
router.delete("/:id", protect, restrictTo("admin"), userController.deleteUser);
router.patch(
  "/:id/block",
  protect,
  restrictTo("admin"),
  userController.blockUser
);
module.exports = router;
