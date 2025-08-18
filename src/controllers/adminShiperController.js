const Shiper = require("../models/Shiper");
const ShiperOrder = require("../models/ShiperOrder");
const ShiperReport = require("../models/ShiperReport");
const Order = require("../models/Order");
const User = require("../models/user");

class AdminShiperController {
  // ====== SHIPER MANAGEMENT ======
  
  // Tạo shiper mới
  async createShiper(req, res) {
    try {
      const {
        user,
        address,
        city,
        district,
        vehicleInfo,
        idCardNumber,
        bankAccount,
        bankName
      } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!user || !user.fullName || !user.phone || !user.email || !user.password) {
        return res.status(400).json({
          message: "Thông tin người dùng không đầy đủ"
        });
      }

      if (!vehicleInfo || !vehicleInfo.type || !vehicleInfo.brand || !vehicleInfo.model || !vehicleInfo.licensePlate) {
        return res.status(400).json({
          message: "Thông tin phương tiện không đầy đủ"
        });
      }

      if (!bankAccount || !bankName) {
        return res.status(400).json({
          message: "Thông tin ngân hàng không đầy đủ"
        });
      }

      // Kiểm tra email đã tồn tại
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        return res.status(400).json({
          message: "Email đã được sử dụng"
        });
      }

      // Kiểm tra số điện thoại đã tồn tại
      const existingPhone = await User.findOne({ phone_number: user.phone });
      if (existingPhone) {
        return res.status(400).json({
          message: "Số điện thoại đã được sử dụng"
        });
      }

      // Tạo user mới
      const newUser = new User({
        name: user.fullName,
        phone_number: user.phone,
        email: user.email,
        password: user.password,
        role: "user"
      });

      await newUser.save();

      // Tạo shiper mới
      const newShiper = new Shiper({
        userId: newUser._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        vehicleType: vehicleInfo.type,
        vehicleInfo: {
          brand: vehicleInfo.brand,
          model: vehicleInfo.model,
          licensePlate: vehicleInfo.licensePlate
        },
        bankInfo: {
          bankName: bankName,
          accountNumber: bankAccount,
          accountHolder: user.fullName
        },
        status: "pending",
        isVerified: false
      });

      await newShiper.save();

      res.status(201).json({
        message: "Tạo shiper thành công",
        shiper: {
          _id: newShiper._id,
          userId: newUser._id,
          fullName: newUser.name,
          email: newUser.email,
          phone: newUser.phone_number,
          vehicleType: newShiper.vehicleType,
          vehicleInfo: newShiper.vehicleInfo,
          bankInfo: newShiper.bankInfo,
          status: newShiper.status,
          isVerified: newShiper.isVerified
        }
      });
    } catch (error) {
      console.error("Lỗi tạo shiper:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }
  
  // Lấy danh sách tất cả shiper
  async getAllShipers(req, res) {
    try {
      const { status, isVerified, page = 1, limit = 10, search } = req.query;

      const query = {};
      
      // Lọc theo trạng thái
      if (status && status !== "all") {
        query.status = status;
      }

      // Lọc theo trạng thái xác minh
      if (isVerified !== undefined) {
        query.isVerified = isVerified === "true";
      }

      // Tìm kiếm theo tên, email, số điện thoại
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const shipers = await Shiper.find(query)
        .populate("userId", "email phone")
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Shiper.countDocuments(query);

      res.json({
        message: "Lấy danh sách shiper thành công",
        shipers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách shiper:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Lấy chi tiết shiper
  async getShiperDetail(req, res) {
    try {
      const { shiperId } = req.params;

      const shiper = await Shiper.findById(shiperId)
        .populate("userId", "email phone")
        .select("-__v");

      if (!shiper) {
        return res.status(404).json({
          message: "Không tìm thấy shiper"
        });
      }

      // Lấy thống kê đơn hàng
      const orderStats = await ShiperOrder.aggregate([
        { $match: { shiperId: shiper._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      // Lấy đơn hàng gần đây
      const recentOrders = await ShiperOrder.find({ shiperId: shiper._id })
        .populate("orderId", "orderCode totalAmount")
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        message: "Lấy chi tiết shiper thành công",
        shiper,
        orderStats,
        recentOrders
      });
    } catch (error) {
      console.error("Lỗi lấy chi tiết shiper:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Cập nhật trạng thái shiper
  async updateShiperStatus(req, res) {
    try {
      const { shiperId } = req.params;
      const { status, reason } = req.body;

      const shiper = await Shiper.findByIdAndUpdate(
        shiperId,
        { status },
        { new: true }
      );

      if (!shiper) {
        return res.status(404).json({
          message: "Không tìm thấy shiper"
        });
      }

      // Nếu khóa shiper, hủy tất cả đơn hàng đang giao
      if (status === "suspended") {
        await ShiperOrder.updateMany(
          { 
            shiperId, 
            status: { $in: ["assigned", "picked_up", "in_transit"] }
          },
          { 
            status: "cancelled",
            cancelledBy: "admin",
            cancelledReason: reason || "Shiper bị khóa",
            cancelledAt: new Date()
          }
        );
      }

      res.json({
        message: "Cập nhật trạng thái shiper thành công",
        shiper
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái shiper:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Xác minh shiper
  async verifyShiper(req, res) {
    try {
      const { shiperId } = req.params;
      const { isVerified, notes } = req.body;

      const shiper = await Shiper.findByIdAndUpdate(
        shiperId,
        { 
          isVerified,
          notes: notes || ""
        },
        { new: true }
      );

      if (!shiper) {
        return res.status(404).json({
          message: "Không tìm thấy shiper"
        });
      }

      res.json({
        message: "Cập nhật trạng thái xác minh thành công",
        shiper
      });
    } catch (error) {
      console.error("Lỗi xác minh shiper:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // ====== ORDER ASSIGNMENT ======
  
  // Lấy danh sách đơn hàng cần assign
  async getOrdersToAssign(req, res) {
    try {
      const { page = 1, limit = 10, priority, area } = req.query;

      const query = { 
        status: { $in: ["confirmed", "processing"] },
        shiperId: { $exists: false }
      };

      // Lọc theo độ ưu tiên
      if (priority && priority !== "all") {
        query.priority = priority;
      }

      // Lọc theo khu vực
      if (area) {
        // Logic lọc theo khu vực địa lý
        // Có thể sử dụng geospatial queries
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const orders = await Order.find(query)
        .populate("userId", "fullName phone")
        .populate("shippingAddress")
        .sort({ priority: -1, createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Order.countDocuments(query);

      res.json({
        message: "Lấy danh sách đơn hàng cần assign thành công",
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng cần assign:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Assign đơn hàng cho shiper
  async assignOrder(req, res) {
    try {
      const { orderId, shiperId } = req.body;

      // Kiểm tra đơn hàng
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          message: "Không tìm thấy đơn hàng"
        });
      }

      if (order.status !== "confirmed" && order.status !== "processing") {
        return res.status(400).json({
          message: "Đơn hàng không thể assign"
        });
      }

      // Kiểm tra shiper
      const shiper = await Shiper.findById(shiperId);
      if (!shiper) {
        return res.status(404).json({
          message: "Không tìm thấy shiper"
        });
      }

      if (shiper.status !== "active") {
        return res.status(400).json({
          message: "Shiper không hoạt động"
        });
      }

      // Kiểm tra shiper có đang giao đơn hàng nào khác không
      const activeOrders = await ShiperOrder.countDocuments({
        shiperId,
        status: { $in: ["assigned", "picked_up", "in_transit"] }
      });

      if (activeOrders >= 3) { // Giới hạn 3 đơn hàng đồng thời
        return res.status(400).json({
          message: "Shiper đang giao quá nhiều đơn hàng"
        });
      }

      // Tạo shiper order
      const shiperOrder = new ShiperOrder({
        orderId,
        shiperId,
        status: "assigned",
        pickupLocation: {
          type: "Point",
          coordinates: [0, 0], // Tọa độ cửa hàng
          address: "Địa chỉ cửa hàng",
          name: "Tên cửa hàng"
        },
        deliveryLocation: {
          type: "Point",
          coordinates: [0, 0], // Tọa độ giao hàng
          address: order.shippingAddress?.address || "",
          customerName: order.userId?.fullName || "",
          customerPhone: order.userId?.phone || "",
          customerNote: order.notes || ""
        },
        codAmount: order.paymentMethod === "cod" ? order.totalAmount : 0,
        deliveryFee: order.shippingFee || 0
      });

      await shiperOrder.save();

      // Cập nhật trạng thái đơn hàng
      await Order.findByIdAndUpdate(orderId, {
        status: "assigned",
        shiperId
      });

      // Emit notification cho shiper
      const io = req.app.get("io");
      io.emit("order_assigned", {
        shiperId,
        orderId,
        orderCode: order.orderCode
      });

      res.json({
        message: "Assign đơn hàng thành công",
        shiperOrder
      });
    } catch (error) {
      console.error("Lỗi assign đơn hàng:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Hủy assign đơn hàng
  async unassignOrder(req, res) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;

      const shiperOrder = await ShiperOrder.findOne({ orderId });
      if (!shiperOrder) {
        return res.status(404).json({
          message: "Không tìm thấy đơn hàng đã assign"
        });
      }

      // Chỉ cho phép hủy khi đơn hàng chưa được lấy
      if (shiperOrder.status !== "assigned") {
        return res.status(400).json({
          message: "Không thể hủy assign đơn hàng đã được lấy"
        });
      }

      // Cập nhật trạng thái
      await ShiperOrder.findByIdAndUpdate(shiperOrder._id, {
        status: "cancelled",
        cancelledBy: "admin",
        cancelledReason: reason || "Admin hủy assign",
        cancelledAt: new Date()
      });

      // Cập nhật đơn hàng chính
      await Order.findByIdAndUpdate(orderId, {
        status: "confirmed",
        $unset: { shiperId: 1 }
      });

      res.json({
        message: "Hủy assign đơn hàng thành công"
      });
    } catch (error) {
      console.error("Lỗi hủy assign đơn hàng:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // ====== SHIPER MONITORING ======
  
  // Lấy vị trí hiện tại của shiper
  async getShiperLocation(req, res) {
    try {
      const { shiperId } = req.params;

      const shiper = await Shiper.findById(shiperId)
        .select("currentLocation fullName phone");

      if (!shiper) {
        return res.status(404).json({
          message: "Không tìm thấy shiper"
        });
      }

      res.json({
        message: "Lấy vị trí shiper thành công",
        location: shiper.currentLocation,
        shiper: {
          fullName: shiper.fullName,
          phone: shiper.phone
        }
      });
    } catch (error) {
      console.error("Lỗi lấy vị trí shiper:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Lấy danh sách shiper đang hoạt động
  async getActiveShipers(req, res) {
    try {
      const { area, vehicleType } = req.query;

      const query = {
        status: "active",
        "workingHours.isWorking": true
      };

      if (vehicleType) {
        query.vehicleType = vehicleType;
      }

      const shipers = await Shiper.find(query)
        .select("fullName phone vehicleType currentLocation workingHours")
        .sort({ "currentLocation.updatedAt": -1 });

      res.json({
        message: "Lấy danh sách shiper đang hoạt động thành công",
        shipers
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách shiper đang hoạt động:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // ====== REPORT MANAGEMENT ======
  
  // Lấy danh sách báo cáo từ shiper
  async getShiperReports(req, res) {
    try {
      const { status, type, severity, page = 1, limit = 10 } = req.query;

      const query = {};
      if (status) query.status = status;
      if (type) query.type = type;
      if (severity) query.severity = severity;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const reports = await ShiperReport.find(query)
        .populate("shiperId", "fullName phone")
        .populate("orderId", "orderCode")
        .populate("assignedTo", "fullName")
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

  // Cập nhật trạng thái báo cáo
  async updateReportStatus(req, res) {
    try {
      const { reportId } = req.params;
      const { status, resolution, assignedTo, notes } = req.body;

      const updateData = { status };
      if (resolution) updateData.resolution = resolution;
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (notes) updateData.resolutionNotes = notes;

      if (status === "resolved") {
        updateData.actualResolutionTime = new Date();
        updateData.resolvedBy = req.userId;
      }

      const report = await ShiperReport.findByIdAndUpdate(
        reportId,
        updateData,
        { new: true }
      ).populate("shiperId", "fullName phone");

      if (!report) {
        return res.status(404).json({
          message: "Không tìm thấy báo cáo"
        });
      }

      res.json({
        message: "Cập nhật trạng thái báo cáo thành công",
        report
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái báo cáo:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // ====== STATISTICS & ANALYTICS ======
  
  // Lấy thống kê tổng quan về shiper
  async getShiperStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Thống kê shiper
      const shiperStats = await Shiper.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalShipers: { $sum: 1 },
            activeShipers: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
            verifiedShipers: { $sum: { $cond: ["$isVerified", 1, 0] } },
            suspendedShipers: { $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] } }
          }
        }
      ]);

      // Thống kê đơn hàng
      const orderStats = await ShiperOrder.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      // Thống kê theo loại xe
      const vehicleStats = await Shiper.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$vehicleType",
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        message: "Lấy thống kê shiper thành công",
        statistics: {
          shiper: shiperStats[0] || {},
          orders: orderStats,
          vehicles: vehicleStats
        }
      });
    } catch (error) {
      console.error("Lỗi lấy thống kê shiper:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }

  // Lấy báo cáo hiệu suất shiper
  async getShiperPerformance(req, res) {
    try {
      const { startDate, endDate, shiperId } = req.query;

      const matchStage = {};
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      if (shiperId) {
        matchStage.shiperId = shiperId;
      }

      const performance = await ShiperOrder.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "shipers",
            localField: "shiperId",
            foreignField: "_id",
            as: "shiper"
          }
        },
        { $unwind: "$shiper" },
        {
          $group: {
            _id: "$shiperId",
            shiperName: { $first: "$shiper.fullName" },
            totalOrders: { $sum: 1 },
            completedOrders: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
            failedOrders: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
            totalEarnings: { $sum: "$deliveryFee" },
            totalDistance: { $sum: "$distance" },
            averageRating: { $avg: "$customerRating" }
          }
        },
        {
          $project: {
            shiperName: 1,
            totalOrders: 1,
            completedOrders: 1,
            failedOrders: 1,
            successRate: { $divide: ["$completedOrders", "$totalOrders"] },
            totalEarnings: 1,
            totalDistance: 1,
            averageRating: { $round: ["$averageRating", 2] }
          }
        },
        { $sort: { successRate: -1 } }
      ]);

      res.json({
        message: "Lấy báo cáo hiệu suất thành công",
        performance
      });
    } catch (error) {
      console.error("Lỗi lấy báo cáo hiệu suất:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }
}

module.exports = new AdminShiperController();
