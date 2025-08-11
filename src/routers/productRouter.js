const express = require("express");
const router = express.Router();
const prodCtrl = require("../controllers/productController");

// Các route đặc biệt phải đặt trước
router.get('/best-sellers', prodCtrl.getBestSellers);
router.get('/newest', prodCtrl.getNewestProducts);
router.get('/popular', prodCtrl.getPopularProducts);
router.get('/search', prodCtrl.searchProducts);
router.get('/category/:categoryId', prodCtrl.getProductsByCategory);
router.get('/category-type/:type', prodCtrl.getProductsByCategoryType);
router.get('/home', prodCtrl.getHomeData);

// Lấy tất cả sản phẩm
router.get('/', prodCtrl.getAllProducts);

// Tạo sản phẩm
router.post('/', prodCtrl.createProduct);

// Lấy, cập nhật, xoá sản phẩm theo ID (luôn đặt cuối cùng)
router.get('/:id/frontend', prodCtrl.getProductForFrontend); // Route tối ưu cho Frontend
router.get('/:id', prodCtrl.getProductById);
router.get('/:id/reviews', prodCtrl.getProductReviews);
router.put('/:id', prodCtrl.updateProduct);
router.delete('/:id', prodCtrl.deleteProduct);
router.patch('/:id/restore', prodCtrl.restoreProduct);
router.post('/:id/increment-views', prodCtrl.incrementViews);
router.post("/decrease-stock", prodCtrl.decreaseProductStock);
router.post("/increase-stock", prodCtrl.increaseProductStock);
module.exports = router;