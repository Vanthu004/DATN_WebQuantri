// src/routers/userRouter.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");
const upload = require("../middlewares/uploadMiddleware");

// Supabase routes
router.get("/supabase-token", authMiddleware, userController.getSupabaseToken);

// Public routes
router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/send-verification-email", authController.sendVerificationEmail);
router.post("/verify-email", authController.verifyEmail);

// Protected routes with specific names (must come before parameterized routes)
router.get("/me", authMiddleware, userController.getCurrentUser);
router.put("/update-profile", authMiddleware, userController.updateProfile);
router.put("/update-avatar", authMiddleware, userController.updateAvatar);
router.put("/change-password", authMiddleware, userController.changePassword);

// Protected routes with parameters (require authentication)
router.get("/", authMiddleware, userController.getAllUsers);
router.get("/avatar/:id", authMiddleware, userController.getAvatar);
router.get("/messages", authMiddleware, userController.getMessages);
router.post('/messages', authMiddleware, userController.sendMessage);
router.get("/messages/conversations", authMiddleware, userController.getConversations);
router.post("/upload-image", authMiddleware, upload.single("image"), userController.uploadImage);
router.get("/:id", authMiddleware, userController.getUserById);
router.put("/:id", authMiddleware, userController.updateUser);
router.delete("/:id", authMiddleware, userController.deleteUser);
router.patch("/:id/block", authMiddleware, userController.blockUser);

module.exports = router;