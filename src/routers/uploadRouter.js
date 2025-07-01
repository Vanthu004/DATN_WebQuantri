// src/routers/uploadRouter.js
const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");

router.post("/upload", uploadController.uploadImage);

module.exports = router;
