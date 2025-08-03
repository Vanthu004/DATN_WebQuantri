const multer = require('multer');

// Lưu trữ file trong bộ nhớ (buffer) để upload lên Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('File phải là ảnh JPEG hoặc PNG'));
  }
});

module.exports = upload;