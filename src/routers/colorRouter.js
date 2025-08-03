const express = require('express');
const router = express.Router();
const colorController = require('../controllers/colorController');

// Tạo color mới
router.post('/', colorController.createColor);
// Lấy tất cả color (có thể lọc xóa)
router.get('/', colorController.getAllColors);
// Lấy color theo id
router.get('/:id', colorController.getColorById);
// Cập nhật color
router.put('/:id', colorController.updateColor);
// Xóa mềm color
router.patch('/:id/soft-delete', colorController.softDeleteColor);
// Khôi phục color đã xóa mềm
router.patch('/:id/restore', colorController.restoreColor);

module.exports = router;
