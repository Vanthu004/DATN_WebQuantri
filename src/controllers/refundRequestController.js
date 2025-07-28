const RefundRequest = require("../models/refundRequestModel");

exports.createRefundRequest = async (req, res) => {
  try {
    const { orderId, userId, reason } = req.body;

    const refund = new RefundRequest({
      orderId,
      userId,
      reason,
    });

    await refund.save();
    res.status(201).json(refund);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo yêu cầu hoàn tiền", error: error.message });
  }
};

exports.getAllRefundRequests = async (req, res) => {
  try {
    const refunds = await RefundRequest.find()
      .populate({
        path: "orderId",
        select: "code products",
        populate: {
          path: "products.productId",
          model: "Product",
          select: "name image",
        },
      })
      .populate("userId", "name email");

    res.json(refunds);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách hoàn tiền", error: error.message });
  }
};

exports.getRefundRequestById = async (req, res) => {
  try {
    const refund = await RefundRequest.findById(req.params.id)
      .populate({
        path: "orderId",
        select: "code products",
        populate: {
          path: "products.productId",
          model: "Product",
          select: "name image",
        },
      })
      .populate("userId", "name email");

    if (!refund) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });

    res.json(refund);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
