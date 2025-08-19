const mongoose = require("mongoose");

const shiperReportSchema = new mongoose.Schema(
  {
    shiperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shiper",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "delivery_failed", // Giao hàng thất bại
        "customer_complaint", // Khiếu nại khách hàng
        "vehicle_issue", // Vấn đề xe cộ
        "road_issue", // Vấn đề đường xá
        "weather_issue", // Vấn đề thời tiết
        "package_damage", // Hàng hóa bị hư hỏng
        "address_issue", // Vấn đề địa chỉ
        "payment_issue", // Vấn đề thanh toán
        "other", // Khác
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "closed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number], // [longitude, latitude]
      address: String,
    },
    photos: [String], // Ảnh chứng minh
    attachments: [String], // File đính kèm
    estimatedResolutionTime: {
      type: Date,
      default: null,
    },
    actualResolutionTime: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin được assign xử lý
      default: null,
    },
    resolution: {
      type: String,
      default: "",
    },
    resolutionNotes: {
      type: String,
      default: "",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerImpact: {
      type: String,
      enum: ["none", "low", "medium", "high"],
      default: "none",
    },
    businessImpact: {
      type: String,
      enum: ["none", "low", "medium", "high"],
      default: "none",
    },
    tags: [String], // Tags để phân loại
    isUrgent: {
      type: Boolean,
      default: false,
    },
    requiresImmediateAction: {
      type: Boolean,
      default: false,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    escalationLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    escalationReason: {
      type: String,
      default: "",
    },
    cost: {
      type: Number,
      default: 0,
    },
    costDescription: {
      type: String,
      default: "",
    },
    preventiveMeasures: {
      type: String,
      default: "",
    },
    lessonsLearned: {
      type: String,
      default: "",
    },
    customerSatisfaction: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    internalRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      enum: ["shiper", "admin", "system"],
      default: "shiper",
    },
    updatedBy: {
      type: String,
      enum: ["shiper", "admin", "system"],
      default: "shiper",
    },
  },
  {
    timestamps: true,
  }
);

// Index cho tìm kiếm
shiperReportSchema.index({ shiperId: 1, status: 1 });
shiperReportSchema.index({ type: 1, status: 1 });
shiperReportSchema.index({ severity: 1, priority: 1 });
shiperReportSchema.index({ assignedTo: 1, status: 1 });
shiperReportSchema.index({ createdAt: -1 });
shiperReportSchema.index({ location: "2dsphere" });

const ShiperReport = mongoose.model("ShiperReport", shiperReportSchema);

module.exports = ShiperReport;
