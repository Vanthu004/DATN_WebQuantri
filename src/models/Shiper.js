const mongoose = require("mongoose");

const shiperSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    vehicleType: {
      type: String,
      enum: ["motorcycle", "bicycle", "car", "truck"],
      required: true,
    },
    vehicleInfo: {
      brand: String,
      model: String,
      licensePlate: String,
      color: String,
    },
    documents: {
      identityCard: String, // Ảnh CMND/CCCD
      drivingLicense: String, // Ảnh bằng lái xe
      vehicleRegistration: String, // Ảnh đăng ký xe
      insurance: String, // Ảnh bảo hiểm xe
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "pending"],
      default: "pending",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: String,
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    workingArea: {
      type: {
        type: String,
        enum: ["Polygon"],
        default: "Polygon",
      },
      coordinates: [[[Number]]], // Array of coordinate arrays
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    statistics: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      completedOrders: {
        type: Number,
        default: 0,
      },
      failedOrders: {
        type: Number,
        default: 0,
      },
      totalEarnings: {
        type: Number,
        default: 0,
      },
      totalDistance: {
        type: Number,
        default: 0, // km
      },
    },
    workingHours: {
      startTime: {
        type: String,
        default: "08:00",
      },
      endTime: {
        type: String,
        default: "18:00",
      },
      isWorking: {
        type: Boolean,
        default: false,
      },
    },
    bankInfo: {
      bankName: String,
      accountNumber: String,
      accountHolder: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index cho geospatial queries
shiperSchema.index({ currentLocation: "2dsphere" });
shiperSchema.index({ workingArea: "2dsphere" });

// Index cho tìm kiếm
shiperSchema.index({ fullName: "text", phone: "text", email: "text" });

const Shiper = mongoose.model("Shiper", shiperSchema);

module.exports = Shiper;
