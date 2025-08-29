const express = require('express');
const router = express.Router();
const variantController = require('../controllers/productVariantController');

router.post('/', variantController.createVariant);
router.get('/:productId', variantController.getVariantsByProduct);
router.put('/:id', variantController.updateVariant);
router.patch('/:id/status', variantController.updateVariantStatus); // Route mới để cập nhật trạng thái
router.delete('/:id', variantController.deleteVariant);

module.exports = router;