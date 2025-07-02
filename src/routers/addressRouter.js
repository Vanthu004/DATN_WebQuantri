const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const authMiddleware = require("../middlewares/authMiddleware");

// Tất cả routes đều yêu cầu xác thực
router.use(authMiddleware);

// Lấy tất cả địa chỉ của user
router.get("/", addressController.getUserAddresses);

// Lấy địa chỉ mặc định
router.get("/default", addressController.getDefaultAddress);

// Tạo địa chỉ mới
router.post("/", addressController.createAddress);

// Đặt địa chỉ làm mặc định
router.patch("/:id/set-default", addressController.setDefaultAddress);

// Lấy địa chỉ theo ID
router.get("/:id", addressController.getAddressById);

// Cập nhật địa chỉ
router.put("/:id", addressController.updateAddress);

// Xóa địa chỉ
router.delete("/:id", addressController.deleteAddress);

module.exports = router; 