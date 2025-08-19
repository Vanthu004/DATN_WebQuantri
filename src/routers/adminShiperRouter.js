const express = require("express");
const router = express.Router();
const adminShiperController = require("../controllers/adminShiperController");
const { body } = require("express-validator");

// ====== VALIDATION RULES ======
const createShiperValidation = [
  body("user.fullName").notEmpty().withMessage("Họ tên không được để trống"),
  body("user.phone").notEmpty().withMessage("Số điện thoại không được để trống"),
  body("user.email").isEmail().withMessage("Email không hợp lệ"),
  body("user.password").isLength({ min: 6 }).withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("vehicleInfo.type").notEmpty().withMessage("Loại phương tiện không được để trống"),
  body("vehicleInfo.brand").notEmpty().withMessage("Hãng xe không được để trống"),
  body("vehicleInfo.model").notEmpty().withMessage("Dòng xe không được để trống"),
  body("vehicleInfo.licensePlate").notEmpty().withMessage("Biển số xe không được để trống"),
  body("bankAccount").notEmpty().withMessage("Số tài khoản ngân hàng không được để trống"),
  body("bankName").notEmpty().withMessage("Tên ngân hàng không được để trống")
];

const updateShiperStatusValidation = [
  body("status").isIn(["active", "inactive", "suspended", "pending"]).withMessage("Trạng thái không hợp lệ"),
  body("reason").optional().isString().withMessage("Lý do phải là chuỗi")
];

const verifyShiperValidation = [
  body("isVerified").isBoolean().withMessage("Trạng thái xác minh phải là boolean"),
  body("notes").optional().isString().withMessage("Ghi chú phải là chuỗi")
];

const assignOrderValidation = [
  body("orderId").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
  body("shiperId").isMongoId().withMessage("ID shiper không hợp lệ")
];

const updateReportStatusValidation = [
  body("status").isIn(["pending", "in_progress", "resolved", "closed"]).withMessage("Trạng thái không hợp lệ"),
  body("resolution").optional().isString().withMessage("Giải pháp phải là chuỗi"),
  body("assignedTo").optional().isMongoId().withMessage("ID người được assign không hợp lệ"),
  body("notes").optional().isString().withMessage("Ghi chú phải là chuỗi")
];

// ====== SHIPER MANAGEMENT ======
router.post("/shipers", createShiperValidation, adminShiperController.createShiper);
router.get("/shipers", adminShiperController.getAllShipers);
router.get("/shipers/:shiperId", adminShiperController.getShiperDetail);
router.put("/shipers/:shiperId/status", updateShiperStatusValidation, adminShiperController.updateShiperStatus);
router.put("/shipers/:shiperId/verify", verifyShiperValidation, adminShiperController.verifyShiper);

// ====== ORDER ASSIGNMENT ======
router.get("/orders-to-assign", adminShiperController.getOrdersToAssign);
router.post("/assign-order", assignOrderValidation, adminShiperController.assignOrder);
router.delete("/orders/:orderId/assign", adminShiperController.unassignOrder);

// ====== SHIPER MONITORING ======
router.get("/shipers/:shiperId/location", adminShiperController.getShiperLocation);
router.get("/active-shipers", adminShiperController.getActiveShipers);

// ====== REPORT MANAGEMENT ======
router.get("/reports", adminShiperController.getShiperReports);
router.put("/reports/:reportId/status", updateReportStatusValidation, adminShiperController.updateReportStatus);

// ====== STATISTICS & ANALYTICS ======
router.get("/statistics", adminShiperController.getShiperStatistics);
router.get("/performance", adminShiperController.getShiperPerformance);

module.exports = router;
