const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// Tạo voucher (dùng chung hoặc cá nhân)
router.post('/', voucherController.createVoucher);
// Áp dụng voucher vào đơn hàng
router.post('/apply-voucher/:voucherId', voucherController.applyVoucherToOrder);
// Lấy tất cả voucher
router.get('/', voucherController.getAllVouchers);
// lấy voucher theo id
router.get('/voucher-by-id/:voucher_id', voucherController.getVoucherByVoucherId);
// lấy voucher theo id user
router.get('/user/:userId?', voucherController.getVouchersByUserId);
// Cập nhật voucher theo voucher_id
router.put('/voucher-by-id/:voucher_id', voucherController.updateVoucherByVoucherId);

// Xóa voucher theo _id
router.delete('/:id', voucherController.deleteVoucher);

// Xóa tất cả voucher theo voucher_id (voucher cá nhân nhiều bản ghi)
router.delete('/voucher-by-id/:voucher_id', voucherController.deleteVoucherByVoucherId);

module.exports = router;
