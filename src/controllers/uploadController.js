// src/controllers/uploadController.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
require("dotenv").config();

// Cấu hình S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Cấu hình multer để nhận file từ form-data
const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      // Tạo tên file ngẫu nhiên
      const fileExt = path.extname(req.file.originalname);
      const fileName = crypto.randomBytes(16).toString("hex") + fileExt;

      // Upload lên S3
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "datn2",
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await s3.send(command);

      const imageUrl = `https://${process.env.AWS_BUCKET_NAME || "datn2"}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      
      // Lưu thông tin upload vào database
      const Upload = require("../models/uploadModel");
      const upload = new Upload({
        fileName: fileName,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: imageUrl,
        uploadedBy: req.user?.userId || null, // Nếu có user đăng nhập
      });
      
      const savedUpload = await upload.save();
      
res.json({
  _id: savedUpload._id.toString(),
  url: imageUrl,
});
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  },
];
