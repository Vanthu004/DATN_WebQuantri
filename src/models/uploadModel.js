const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  fileName: String,
  originalName: String,
  mimeType: String,
  size: Number,
  url: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  relatedTo: {
    model: String,
    id: mongoose.Schema.Types.ObjectId,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Upload", uploadSchema);
