const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");

// Public routes
router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/send-verification-email", authController.sendVerificationEmail);
router.post("/verify-email", authController.verifyEmail);

// Protected routes với tên cụ thể (phải đặt trước routes có parameter)
router.get("/me", authMiddleware, userController.getCurrentUser);
router.put("/update-profile", authMiddleware, userController.updateProfile);
router.put("/update-avatar", authMiddleware, userController.updateAvatar);
router.put("/change-password", authMiddleware, userController.changePassword);

// Protected routes (yêu cầu xác thực)
router.get("/", authMiddleware, userController.getAllUsers);
router.get("/all", userController.getAllUsers);
// Routes cho thống kê khách hàng (đặt trước routes có :id để tránh conflict)
router.get("/statistics", authMiddleware, userController.getCustomerStatistics);
router.get("/top-customers", authMiddleware, userController.getTopCustomers);
router.get("/avatar/:id", userController.getAvatar);
router.get("/:id", authMiddleware, userController.getUserById);
router.put("/:id", authMiddleware, userController.updateUser);
router.delete("/:id", authMiddleware, userController.deleteUser);
router.patch("/:id/block", authMiddleware, userController.blockUser);
// Cập nhật role cho user (cấp quyền)
router.patch("/:id/role", authMiddleware, userController.updateUserRole);

// (đã di chuyển routes thống kê lên trên để tránh bị bắt bởi ":id")

module.exports = router;
