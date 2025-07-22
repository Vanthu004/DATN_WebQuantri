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
router.put("/update-profile", authMiddleware, userController.updateProfile);
router.put("/update-avatar", authMiddleware, userController.updateAvatar);
router.put("/change-password", authMiddleware, userController.changePassword);
// router.get("/profile", authMiddleware, userController.getProfile);
// Protected routes (yêu cầu xác thực) - routes có parameter
router.get("/", authMiddleware, userController.getAllUsers);
router.get("/avatar/:id", userController.getAvatar);
router.get("/:id", authMiddleware, userController.getUserById);
router.put("/:id", authMiddleware, userController.updateUser);
router.delete("/:id", authMiddleware, userController.deleteUser);
router.patch("/:id/block", authMiddleware, userController.blockUser);

module.exports = router;
