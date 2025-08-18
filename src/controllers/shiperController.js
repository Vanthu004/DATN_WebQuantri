const Shiper = require("../models/Shiper");
const ShiperOrder = require("../models/ShiperOrder");
const ShiperReport = require("../models/ShiperReport");
const Order = require("../models/Order");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

class ShiperController {
  // ====== AUTHENTICATION ======
  
  // Đăng ký shiper
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, phone, password, fullName, vehicleType, vehicleInfo } = req.body;

      // Kiểm tra email và phone đã tồn tại
      const existingShiper = await Shiper.findOne({
        $or: [{ email }, { phone }]
      });

      if (existingShiper) {
        return res.status(400).json({
          message: "Email hoặc số điện thoại đã được sử dụng"
        });
      }

      // Tạo user mới
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        phone,
        password: hashedPassword,
        fullName,
        role: "shiper",
        isVerified: false
      });

      await user.save();

      // Tạo profile shiper
      const shiper = new Shiper({
        userId: user._id,
        email,
        phone,
        fullName,
        vehicleType,
        vehicleInfo: vehicleInfo || {},
        status: "pending"
      });

      await shiper.save();

      // Tạo JWT token
      const token = jwt.sign(
        { userId: user._id, role: "shiper" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "Đăng ký shiper thành công",
        token,
        shiper: {
          id: shiper._id,
          fullName: shiper.fullName,
          email: shiper.email,
          phone: shiper.phone,
          status: shiper.status,
          vehicleType: shiper.vehicleType
        }
      });
    } catch (error) {
      console.error("Lỗi đăng ký shiper:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Đăng nhập shiper
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Tìm shiper theo email
      const shiper = await Shiper.findOne({ email }).populate("userId");
      if (!shiper) {
        return res.status(401).json({
          message: "Email hoặc mật khẩu không đúng"
        });
      }

      // Kiểm tra mật khẩu
      const isValidPassword = await bcrypt.compare(password, shiper.userId.password);
      if (!isValidPassword) {
        return res.status(401).json({
          message: "Email hoặc mật khẩu không đúng"
        });
      }

      // Kiểm tra trạng thái shiper
      if (shiper.status === "suspended") {
        return res.status(403).json({
          message: "Tài khoản shiper đã bị khóa"
        });
      }

      // Tạo JWT token
      const token = jwt.sign(
        { userId: shiper.userId._id, role: "shiper", shiperId: shiper._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Đăng nhập thành công",
        token,
        shiper: {
          id: shiper._id,
          fullName: shiper.fullName,
          email: shiper.email,
          phone: shiper.phone,
          status: shiper.status,
          vehicleType: shiper.vehicleType,
          avatar: shiper.avatar,
          isVerified: shiper.isVerified
        }
      });
    } catch (error) {
      console.error("Lỗi đăng nhập shiper:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // ====== PROFILE MANAGEMENT ======
  
  // Lấy thông tin profile shiper
  async getProfile(req, res) {
    try {
      const shiperId = req.shiperId;
      
      const shiper = await Shiper.findById(shiperId)
        .select("-__v")
        .populate("userId", "email phone");

      if (!shiper) {
        return res.status(404).json({
          message: "Không tìm thấy thông tin shiper"
        });
      }

      res.json({
        message: "Lấy thông tin profile thành công",
        shiper
      });
    } catch (error) {
      console.error("Lỗi lấy profile shiper:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Cập nhật profile shiper
  async updateProfile(req, res) {
    try {
      const shiperId = req.shiperId;
      const updateData = req.body;

      // Loại bỏ các trường không được phép cập nhật
      delete updateData.userId;
      delete updateData.status;
      delete updateData.isVerified;
      delete updateData.statistics;

      const shiper = await Shiper.findByIdAndUpdate(
        shiperId,
        updateData,
        { new: true, runValidators: true }
      ).select("-__v");

      if (!shiper) {
        return res.status(404).json({
          message: "Không tìm thấy shiper"
        });
      }

      res.json({
        message: "Cập nhật profile thành công",
        shiper
      });
    } catch (error) {
      console.error("Lỗi cập nhật profile shiper:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Cập nhật vị trí hiện tại
  async updateLocation(req, res) {
    try {
      const shiperId = req.shiperId;
      const { longitude, latitude, address } = req.body;

      if (!longitude || !latitude) {
        return res.status(400).json({
          message: "Tọa độ vị trí không hợp lệ"
        });
      }

      const shiper = await Shiper.findByIdAndUpdate(
        shiperId,
        {
          currentLocation: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
            address: address || "",
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      if (!shiper) {
        return res.status(404).json({
          message: "Không tìm thấy shiper"
        });
      }

      // Emit location update qua Socket.IO
      const io = req.app.get("io");
      io.emit("shiper_location_update", {
        shiperId,
        location: shiper.currentLocation
      });

      res.json({
        message: "Cập nhật vị trí thành công",
        location: shiper.currentLocation
      });
    } catch (error) {
      console.error("Lỗi cập nhật vị trí:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Cập nhật trạng thái làm việc
  async updateWorkingStatus(req, res) {
    try {
      const shiperId = req.shiperId;
      const { isWorking, startTime, endTime } = req.body;

      const updateData = { "workingHours.isWorking": isWorking };
      if (startTime) updateData["workingHours.startTime"] = startTime;
      if (endTime) updateData["workingHours.endTime"] = endTime;

      const shiper = await Shiper.findByIdAndUpdate(
        shiperId,
        updateData,
        { new: true }
      );

      if (!shiper) {
        return res.status(404).json({
          message: "Không tìm thấy shiper"
        });
      }

      res.json({
        message: "Cập nhật trạng thái làm việc thành công",
        workingHours: shiper.workingHours
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái làm việc:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // ====== ORDER MANAGEMENT ======
  
  // Lấy danh sách đơn hàng của shiper
  async getOrders(req, res) {
    try {
      const shiperId = req.shiperId;
      const { status, page = 1, limit = 10, search } = req.query;

      const query = { shiperId };
      
      // Lọc theo trạng thái
      if (status && status !== "all") {
        query.status = status;
      }

      // Tìm kiếm theo mã đơn hàng hoặc địa chỉ
      if (search) {
        query.$or = [
          { "orderId": { $regex: search, $options: "i" } },
          { "deliveryLocation.address": { $regex: search, $options: "i" } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const orders = await ShiperOrder.find(query)
        .populate("orderId", "orderCode totalAmount paymentMethod")
        .populate("shiperId", "fullName phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await ShiperOrder.countDocuments(query);

      res.json({
        message: "Lấy danh sách đơn hàng thành công",
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Lấy chi tiết đơn hàng
  async getOrderDetail(req, res) {
    try {
      const { orderId } = req.params;
      const shiperId = req.shiperId;

      const shiperOrder = await ShiperOrder.findOne({
        orderId,
        shiperId
      }).populate([
        {
          path: "orderId",
          populate: [
            { path: "userId", select: "fullName phone email" },
            { path: "orderDetails.productId", select: "name images price" }
          ]
        },
        { path: "shiperId", select: "fullName phone" }
      ]);

      if (!shiperOrder) {
        return res.status(404).json({
          message: "Không tìm thấy đơn hàng"
        });
      }

      res.json({
        message: "Lấy chi tiết đơn hàng thành công",
        order: shiperOrder
      });
    } catch (error) {
      console.error("Lỗi lấy chi tiết đơn hàng:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // ====== DELIVERY STATUS UPDATE ======
  
  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const shiperId = req.shiperId;
      const { status, note, location, photos } = req.body;

      const shiperOrder = await ShiperOrder.findOne({
        orderId,
        shiperId
      });

      if (!shiperOrder) {
        return res.status(404).json({
          message: "Không tìm thấy đơn hàng"
        });
      }

      // Cập nhật trạng thái và thời gian
      const updateData = { status };
      const currentTime = new Date();

      switch (status) {
        case "picked_up":
          updateData.actualPickupTime = currentTime;
          break;
        case "in_transit":
          updateData.pickupTime = currentTime;
          break;
        case "delivered":
          updateData.actualDeliveryTime = currentTime;
          updateData.deliveryTime = currentTime;
          break;
        case "failed":
          updateData.failureReason = note || "";
          if (photos) updateData.failurePhotos = photos;
          break;
      }

      // Thêm vào lịch sử tracking
      updateData.$push = {
        trackingHistory: {
          status,
          timestamp: currentTime,
          location: location || shiperOrder.currentLocation,
          note: note || "",
          updatedBy: "shiper"
        }
      };

      const updatedOrder = await ShiperOrder.findByIdAndUpdate(
        shiperOrder._id,
        updateData,
        { new: true }
      ).populate("orderId", "orderCode status");

      // Emit status update qua Socket.IO
      const io = req.app.get("io");
      io.emit("order_status_update", {
        orderId,
        status,
        shiperId,
        timestamp: currentTime
      });

      // Cập nhật trạng thái đơn hàng chính
      await Order.findByIdAndUpdate(orderId, {
        status: this.mapShiperStatusToOrderStatus(status)
      });

      res.json({
        message: "Cập nhật trạng thái đơn hàng thành công",
        order: updatedOrder
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đơn hàng:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Xác nhận giao hàng thành công
  async confirmDelivery(req, res) {
    try {
      const { orderId } = req.params;
      const shiperId = req.shiperId;
      const { deliveryProof, signature, note, actualCodAmount } = req.body;

      const shiperOrder = await ShiperOrder.findOne({
        orderId,
        shiperId
      });

      if (!shiperOrder) {
        return res.status(404).json({
          message: "Không tìm thấy đơn hàng"
        });
      }

      if (shiperOrder.status !== "in_transit") {
        return res.status(400).json({
          message: "Đơn hàng không ở trạng thái đang giao"
        });
      }

      const updateData = {
        status: "delivered",
        actualDeliveryTime: new Date(),
        deliveryTime: new Date(),
        deliveryProof: deliveryProof || "",
        signature: signature || "",
        shiperNotes: note || ""
      };

      // Xử lý COD
      if (shiperOrder.codAmount > 0) {
        updateData.actualCodAmount = actualCodAmount || shiperOrder.codAmount;
        updateData.codDifference = (actualCodAmount || shiperOrder.codAmount) - shiperOrder.codAmount;
        updateData.paymentStatus = "collected";
      }

      // Thêm vào lịch sử tracking
      updateData.$push = {
        trackingHistory: {
          status: "delivered",
          timestamp: new Date(),
          note: note || "Giao hàng thành công",
          updatedBy: "shiper"
        }
      };

      const updatedOrder = await ShiperOrder.findByIdAndUpdate(
        shiperOrder._id,
        updateData,
        { new: true }
      );

      // Cập nhật trạng thái đơn hàng chính
      await Order.findByIdAndUpdate(orderId, {
        status: "delivered",
        deliveredAt: new Date()
      });

      // Cập nhật thống kê shiper
      await this.updateShiperStatistics(shiperId, "delivered");

      res.json({
        message: "Xác nhận giao hàng thành công",
        order: updatedOrder
      });
    } catch (error) {
      console.error("Lỗi xác nhận giao hàng:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // ====== PAYMENT UPDATE ======
  
  // Cập nhật trạng thái thanh toán COD
  async updatePaymentStatus(req, res) {
    try {
      const { orderId } = req.params;
      const shiperId = req.shiperId;
      const { paymentStatus, actualCodAmount, reason } = req.body;

      const shiperOrder = await ShiperOrder.findOne({
        orderId,
        shiperId
      });

      if (!shiperOrder) {
        return res.status(404).json({
          message: "Không tìm thấy đơn hàng"
        });
      }

      const updateData = {
        paymentStatus,
        actualCodAmount: actualCodAmount || shiperOrder.codAmount
      };

      if (actualCodAmount !== shiperOrder.codAmount) {
        updateData.codDifference = actualCodAmount - shiperOrder.codAmount;
        updateData.codDifferenceReason = reason || "";
      }

      const updatedOrder = await ShiperOrder.findByIdAndUpdate(
        shiperOrder._id,
        updateData,
        { new: true }
      );

      res.json({
        message: "Cập nhật trạng thái thanh toán thành công",
        order: updatedOrder
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái thanh toán:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // ====== REPORTING ======
  
  // Tạo báo cáo sự cố
  async createReport(req, res) {
    try {
      const shiperId = req.shiperId;
      const reportData = req.body;

      const report = new ShiperReport({
        ...reportData,
        shiperId,
        createdBy: "shiper"
      });

      await report.save();

      // Emit notification cho admin
      const io = req.app.get("io");
      io.emit("new_shiper_report", {
        reportId: report._id,
        shiperId,
        type: report.type,
        severity: report.severity
      });

      res.status(201).json({
        message: "Tạo báo cáo thành công",
        report
      });
    } catch (error) {
      console.error("Lỗi tạo báo cáo:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Lấy danh sách báo cáo của shiper
  async getReports(req, res) {
    try {
      const shiperId = req.shiperId;
      const { status, type, page = 1, limit = 10 } = req.query;

      const query = { shiperId };
      if (status) query.status = status;
      if (type) query.type = type;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const reports = await ShiperReport.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await ShiperReport.countDocuments(query);

      res.json({
        message: "Lấy danh sách báo cáo thành công",
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách báo cáo:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // ====== STATISTICS ======
  
  // Lấy thống kê shiper
  async getStatistics(req, res) {
    try {
      const shiperId = req.shiperId;
      const { startDate, endDate } = req.query;

      const query = { shiperId };
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const orders = await ShiperOrder.find(query);
      
      const statistics = {
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === "delivered").length,
        failedOrders: orders.filter(o => o.status === "failed").length,
        totalEarnings: orders
          .filter(o => o.status === "delivered")
          .reduce((sum, o) => sum + (o.deliveryFee || 0), 0),
        totalDistance: orders
          .filter(o => o.status === "delivered")
          .reduce((sum, o) => sum + (o.distance || 0), 0),
        averageRating: 0,
        totalReviews: 0
      };

      // Tính rating trung bình
      const ratedOrders = orders.filter(o => o.customerRating);
      if (ratedOrders.length > 0) {
        statistics.averageRating = ratedOrders.reduce((sum, o) => sum + o.customerRating, 0) / ratedOrders.length;
        statistics.totalReviews = ratedOrders.length;
      }

      res.json({
        message: "Lấy thống kê thành công",
        statistics
      });
    } catch (error) {
      console.error("Lỗi lấy thống kê:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // ====== HELPER METHODS ======
  
  // Map trạng thái shiper sang trạng thái đơn hàng
  mapShiperStatusToOrderStatus(shiperStatus) {
    const statusMap = {
      "assigned": "assigned",
      "picked_up": "picked_up",
      "in_transit": "in_transit",
      "delivered": "delivered",
      "failed": "failed",
      "returned": "returned",
      "cancelled": "cancelled"
    };
    return statusMap[shiperStatus] || "assigned";
  }

  // Cập nhật thống kê shiper
  async updateShiperStatistics(shiperId, action) {
    try {
      const updateData = {};
      
      switch (action) {
        case "delivered":
          updateData.$inc = {
            "statistics.totalOrders": 1,
            "statistics.completedOrders": 1
          };
          break;
        case "failed":
          updateData.$inc = {
            "statistics.totalOrders": 1,
            "statistics.failedOrders": 1
          };
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await Shiper.findByIdAndUpdate(shiperId, updateData);
      }
    } catch (error) {
      console.error("Lỗi cập nhật thống kê shiper:", error);
    }
  }
}

module.exports = new ShiperController();
