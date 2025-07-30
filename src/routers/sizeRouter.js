const express = require('express');
const router = express.Router();
const sizeController = require('../controllers/sizeController');

// Tạo size mới
router.post('/', sizeController.createSize);
// Lấy tất cả size (có thể lọc xóa)
router.get('/', sizeController.getAllSizes);
// Lấy size theo id
router.get('/:id', sizeController.getSizeById);
// Cập nhật size
router.put('/:id', sizeController.updateSize);
// Xóa mềm size
router.patch('/:id/soft-delete', sizeController.softDeleteSize);
// Khôi phục size đã xóa mềm
router.patch('/:id/restore', sizeController.restoreSize);

module.exports = router;
