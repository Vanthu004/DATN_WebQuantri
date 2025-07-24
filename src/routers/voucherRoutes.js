const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// Tạo voucher (dùng chung hoặc cá nhân)
router.post('/', voucherController.createVoucher);

// Lấy tất cả voucher
router.get('/', voucherController.getAllVouchers);
// lấy voucher theo id
router.get('/voucher-by-id/:voucher_id', voucherController.getVoucherByVoucherId);
// Cập nhật voucher theo voucher_id
router.put('/voucher-by-id/:voucher_id', voucherController.updateVoucherByVoucherId);

// Xóa voucher theo _id
router.delete('/:id', voucherController.deleteVoucher);

// Xóa tất cả voucher theo voucher_id (voucher cá nhân nhiều bản ghi)
router.delete('/voucher-by-id/:voucher_id', voucherController.deleteVoucherByVoucherId);

module.exports = router;
