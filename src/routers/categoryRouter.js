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

module.exports = router;
