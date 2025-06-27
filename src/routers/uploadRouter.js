// src/routers/uploadRouter.js
const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public route để upload ảnh (có thể cần auth tùy theo yêu cầu)
router.post("/upload", authMiddleware, uploadController.uploadImage);

// Protected routes
router.get("/uploads", authMiddleware, uploadController.getUploads);
router.delete("/uploads/:id", authMiddleware, uploadController.deleteUpload);

module.exports = router;
