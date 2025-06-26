// src/controllers/uploadController.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const Upload = require("../models/uploadModel");
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
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép upload file ảnh!"), false);
    }
  },
});

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
      const uploadRecord = new Upload({
        fileName: fileName,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: imageUrl,
        uploadedBy: req.user ? req.user.userId : null,
        relatedTo: {
          model: req.body.relatedModel || "User",
          id: req.body.relatedId || null,
        },
      });

      await uploadRecord.save();

      res.json({ 
        message: "Upload thành công",
        upload: uploadRecord,
        url: imageUrl 
      });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  },
];

// Lấy danh sách uploads
exports.getUploads = async (req, res) => {
  try {
    const uploads = await Upload.find()
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });
    
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa upload
exports.deleteUpload = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ message: "Không tìm thấy upload" });
    }

    // TODO: Xóa file từ S3 nếu cần

    await Upload.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa upload thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
