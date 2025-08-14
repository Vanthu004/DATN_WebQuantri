const multer = require("multer");
const path = require("path");

// Thư mục lưu trữ ảnh review
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/reviews/"); // thư mục lưu ảnh
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Chỉ hỗ trợ file ảnh JPG, PNG"), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
