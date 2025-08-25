const jwt = require("jsonwebtoken");
const Shiper = require("../models/Shiper");

const shiperAuthMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Không có token xác thực"
      });
    }

    const token = authHeader.substring(7); // Bỏ "Bearer " prefix

    // Xác thực JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kiểm tra role
    if (decoded.role !== "shiper") {
      return res.status(403).json({
        message: "Không có quyền truy cập"
      });
    }

    // Kiểm tra shiper có tồn tại và đang hoạt động
    const shiper = await Shiper.findById(decoded.shiperId);
    if (!shiper) {
      return res.status(401).json({
        message: "Shiper không tồn tại"
      });
    }

    if (shiper.status === "suspended") {
      return res.status(403).json({
        message: "Tài khoản shiper đã bị khóa"
      });
    }

    // Lưu thông tin shiper vào request
    req.userId = decoded.userId;
    req.shiperId = decoded.shiperId;
    req.shiperRole = decoded.role;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Token không hợp lệ"
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token đã hết hạn"
      });
    }

    console.error("Lỗi xác thực shiper:", error);
    res.status(500).json({
      message: "Lỗi server xác thực",
      error: error.message
    });
  }
};

// Middleware kiểm tra shiper đang làm việc
const checkShiperWorking = async (req, res, next) => {
  try {
    const shiperId = req.shiperId;
    
    const shiper = await Shiper.findById(shiperId);
    if (!shiper) {
      return res.status(404).json({
        message: "Không tìm thấy shiper"
      });
    }

    if (!shiper.workingHours.isWorking) {
      return res.status(403).json({
        message: "Shiper không trong giờ làm việc"
      });
    }

    next();
  } catch (error) {
    console.error("Lỗi kiểm tra trạng thái làm việc:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Middleware kiểm tra shiper đã xác minh
const checkShiperVerified = async (req, res, next) => {
  try {
    const shiperId = req.shiperId;
    
    const shiper = await Shiper.findById(shiperId);
    if (!shiper) {
      return res.status(404).json({
        message: "Không tìm thấy shiper"
      });
    }

    if (!shiper.isVerified) {
      return res.status(403).json({
        message: "Shiper chưa được xác minh"
      });
    }

    next();
  } catch (error) {
    console.error("Lỗi kiểm tra xác minh shiper:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Middleware kiểm tra quyền truy cập đơn hàng
const checkOrderAccess = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const shiperId = req.shiperId;

    const ShiperOrder = require("../models/ShiperOrder");
    const shiperOrder = await ShiperOrder.findOne({
      orderId,
      shiperId
    });

    if (!shiperOrder) {
      return res.status(403).json({
        message: "Không có quyền truy cập đơn hàng này"
      });
    }

    // Lưu thông tin đơn hàng vào request
    req.shiperOrder = shiperOrder;
    next();
  } catch (error) {
    console.error("Lỗi kiểm tra quyền truy cập đơn hàng:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Middleware kiểm tra trạng thái đơn hàng
const checkOrderStatus = (allowedStatuses) => {
  return (req, res, next) => {
    try {
      const shiperOrder = req.shiperOrder;
      
      if (!allowedStatuses.includes(shiperOrder.status)) {
        return res.status(400).json({
          message: `Đơn hàng phải ở trạng thái: ${allowedStatuses.join(", ")}`
        });
      }

      next();
    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái đơn hàng:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  };
};

module.exports = {
  shiperAuthMiddleware,
  checkShiperWorking,
  checkShiperVerified,
  checkOrderAccess,
  checkOrderStatus
};
