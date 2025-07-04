const express = require("express");
const router = express.Router();
const categoryCtrl = require("../controllers/categoryController");

router
  .route("/")
  .post(categoryCtrl.createCategory)
  .get(categoryCtrl.getCategories);

router
  .route("/:id")
  .get(categoryCtrl.getCategoryById)
  .put(categoryCtrl.updateCategory)
  .delete(categoryCtrl.deleteCategory);

router.put('/sort-orders', categoryCtrl.updateSortOrders);

router.get('/by-category-type/:categoryTypeId', categoryCtrl.getCategoriesByCategoryType);

module.exports = router;
