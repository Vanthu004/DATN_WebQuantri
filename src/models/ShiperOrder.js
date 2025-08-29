const mongoose = require("mongoose");

const shiperOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    shiperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shiper",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "assigned", // Đã được assign
        "picked_up", // Đã lấy hàng từ cửa hàng
        "in_transit", // Đang giao hàng
        "delivered", // Giao thành công
        "failed", // Giao thất bại
        "returned", // Trả hàng
        "cancelled", // Hủy đơn
      ],
      default: "assigned",
    },
    pickupTime: {
      type: Date,
      default: null,
    },
    deliveryTime: {
      type: Date,
      default: null,
    },
    estimatedPickupTime: {
      type: Date,
      default: null,
    },
    estimatedDeliveryTime: {
      type: Date,
      default: null,
    },
    actualPickupTime: {
      type: Date,
      default: null,
    },
    actualDeliveryTime: {
      type: Date,
      default: null,
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number], // [longitude, latitude]
      address: String,
      name: String, // Tên cửa hàng
    },
    deliveryLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number], // [longitude, latitude]
      address: String,
      customerName: String,
      customerPhone: String,
      customerNote: String,
    },
    distance: {
      type: Number, // km
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    codAmount: {
      type: Number, // Số tiền thu hộ
      default: 0,
    },
    actualCodAmount: {
      type: Number, // Số tiền thực tế thu được
      default: 0,
    },
    codDifference: {
      type: Number, // Chênh lệch tiền thu hộ
      default: 0,
    },
    codDifferenceReason: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "collected", "failed", "refunded"],
      default: "pending",
    },
    deliveryProof: {
      type: String, // Ảnh chứng minh giao hàng
      default: "",
    },
    signature: {
      type: String, // Chữ ký khách hàng
      default: "",
    },
    failureReason: {
      type: String,
      default: "",
    },
    failurePhotos: [String], // Ảnh chứng minh giao thất bại
    notes: {
      type: String,
      default: "",
    },
    shiperNotes: {
      type: String,
      default: "",
    },
    customerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    customerFeedback: {
      type: String,
      default: "",
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ["shiper", "admin", "customer", "system"],
      default: null,
    },
    cancelledReason: {
      type: String,
      default: "",
    },
    trackingHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: [Number],
          address: String,
        },
        note: String,
        updatedBy: {
          type: String,
          enum: ["shiper", "admin", "system"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index cho tìm kiếm
shiperOrderSchema.index({ orderId: 1, shiperId: 1 });
shiperOrderSchema.index({ shiperId: 1, status: 1 });
shiperOrderSchema.index({ status: 1, assignedAt: 1 });
shiperOrderSchema.index({ pickupLocation: "2dsphere" });
shiperOrderSchema.index({ deliveryLocation: "2dsphere" });

const ShiperOrder = mongoose.model("ShiperOrder", shiperOrderSchema);

module.exports = ShiperOrder;
