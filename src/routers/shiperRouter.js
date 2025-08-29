const express = require("express");
const router = express.Router();
const shiperController = require("../controllers/shiperController");
const { 
  shiperAuthMiddleware, 
  checkShiperWorking, 
  checkShiperVerified,
  checkOrderAccess,
  checkOrderStatus
} = require("../middlewares/shiperAuthMiddleware");
const { body } = require("express-validator");

// ====== VALIDATION RULES ======
const registerValidation = [
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("phone").isMobilePhone("vi-VN").withMessage("Số điện thoại không hợp lệ"),
  body("password").isLength({ min: 6 }).withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("fullName").notEmpty().withMessage("Họ tên không được để trống"),
  body("vehicleType").isIn(["motorcycle", "bicycle", "car", "truck"]).withMessage("Loại xe không hợp lệ")
];

const loginValidation = [
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password").notEmpty().withMessage("Mật khẩu không được để trống")
];

const updateProfileValidation = [
  body("fullName").optional().notEmpty().withMessage("Họ tên không được để trống"),
  body("phone").optional().isMobilePhone("vi-VN").withMessage("Số điện thoại không hợp lệ"),
  body("vehicleType").optional().isIn(["motorcycle", "bicycle", "car", "truck"]).withMessage("Loại xe không hợp lệ")
];

const updateLocationValidation = [
  body("longitude").isFloat({ min: -180, max: 180 }).withMessage("Kinh độ không hợp lệ"),
  body("latitude").isFloat({ min: -90, max: 90 }).withMessage("Vĩ độ không hợp lệ")
];

const updateOrderStatusValidation = [
  body("status").isIn(["assigned", "picked_up", "in_transit", "delivered", "failed", "returned", "cancelled"]).withMessage("Trạng thái không hợp lệ"),
  body("note").optional().isString().withMessage("Ghi chú phải là chuỗi"),
  body("photos").optional().isArray().withMessage("Photos phải là mảng")
];

const createReportValidation = [
  body("type").isIn(["delivery_failed", "customer_complaint", "vehicle_issue", "road_issue", "weather_issue", "package_damage", "address_issue", "payment_issue", "other"]).withMessage("Loại báo cáo không hợp lệ"),
  body("title").notEmpty().withMessage("Tiêu đề không được để trống"),
  body("description").notEmpty().withMessage("Mô tả không được để trống"),
  body("severity").optional().isIn(["low", "medium", "high", "critical"]).withMessage("Mức độ nghiêm trọng không hợp lệ")
];

// ====== AUTHENTICATION ROUTES ======
router.post("/register", registerValidation, shiperController.register);
router.post("/login", loginValidation, shiperController.login);

// ====== PROTECTED ROUTES ======
router.use(shiperAuthMiddleware);

// ====== PROFILE MANAGEMENT ======
router.get("/profile", shiperController.getProfile);
router.put("/profile", updateProfileValidation, shiperController.updateProfile);
router.put("/location", updateLocationValidation, shiperController.updateLocation);
router.put("/working-status", shiperController.updateWorkingStatus);

// ====== ORDER MANAGEMENT ======
router.get("/orders", shiperController.getOrders);
router.get("/orders/:orderId", checkOrderAccess, shiperController.getOrderDetail);

// ====== DELIVERY STATUS UPDATE ======
router.put("/orders/:orderId/status", 
  checkOrderAccess, 
  updateOrderStatusValidation, 
  shiperController.updateOrderStatus
);

router.put("/orders/:orderId/confirm-delivery", 
  checkOrderAccess, 
  checkOrderStatus(["in_transit"]),
  shiperController.confirmDelivery
);

// ====== PAYMENT UPDATE ======
router.put("/orders/:orderId/payment", 
  checkOrderAccess, 
  shiperController.updatePaymentStatus
);

// ====== REPORTING ======
router.post("/reports", createReportValidation, shiperController.createReport);
router.get("/reports", shiperController.getReports);

// ====== STATISTICS ======
router.get("/statistics", shiperController.getStatistics);

module.exports = router;
