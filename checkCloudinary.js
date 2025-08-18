const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: './.env' }); // Load .env từ thư mục gốc dự án

// Kiểm tra biến môi trường
console.log('Cloudinary config từ .env:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '[HIDDEN]' : undefined,
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
});

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Hàm kiểm tra tài nguyên
async function checkCloudinaryImages() {
  try {
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload', // Thêm type: 'upload'
      prefix: 'swear_chat', // Sửa thành folder đúng
      max_results: 10
    });
    console.log('Danh sách ảnh trong folder swear_chat:', result.resources);
    return result.resources;
  } catch (error) {
    console.error('Lỗi kiểm tra Cloudinary:', error);
    return [];
  }
}

checkCloudinaryImages();