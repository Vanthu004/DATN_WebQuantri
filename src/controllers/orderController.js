const Order = require("../models/Order");
const OrderDetail = require("../models/orderDetail");
const Product = require("../models/product");

/* Tạo đơn hàng mới */
exports.createOrder = async (req, res) => {
  try {
    // Tạo order_code tự động
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const dateStr = dd + mm + yyyy;

    // Tìm order cuối cùng trong ngày
    const regex = new RegExp(`^ORDER(\\d{3})${dateStr}$`);
    const lastOrder = await Order.findOne({
      order_code: { $regex: regex },
    }).sort({ order_code: -1 });

    let nextNumber = 1;
    if (lastOrder) {
      const match = lastOrder.order_code.match(/^ORDER(\d{3})/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const order_code = `ORDER${String(nextNumber).padStart(3, "0")}${dateStr}`;

    // Tạo đơn hàng mới với order_code tự sinh
    const order = await Order.create({
      ...req.body,
      order_code,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả đơn hàng */
exports.getAllOrders = async (_req, res) => {
  try {
    const list = await Order.find()
      .populate("user_id", "name email")
      .populate("shippingmethod_id", "name")
      .populate("paymentmethod_id", "name");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy đơn hàng theo ID */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id", "name email")
      .populate("shippingmethod_id", "name")
      .populate("paymentmethod_id", "name");
    if (!order) return res.status(404).json({ msg: "Không tìm thấy đơn hàng" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy đơn hàng của 1 user */
exports.getOrdersByUser = async (req, res) => {
  try {
    const list = await Order.find({ user_id: req.params.userId });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hàm kiểm tra hợp lệ khi chuyển trạng thái đơn hàng
function isValidStatusTransition(current, next) {
  const transitions = {
    "Chờ xử lý": ["Đã xác nhận", "Đã hủy"],
    "Đã xác nhận": ["Đang vận chuyển"],
    "Đang vận chuyển": ["Đã giao hàng"],
    "Đã giao hàng": ["Hoàn thành"],
    "Hoàn thành": ["Đã hủy"],
    "Đã hủy": [],
  };
  return transitions[current]?.includes(next);
}

/* Cập nhật đơn hàng */
exports.updateOrder = async (req, res) => {
  try {
    // Nếu có cập nhật trạng thái
    if (req.body.status) {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ msg: "Không tìm thấy đơn" });
      const currentStatus = order.status;
      const nextStatus = req.body.status;
      if (currentStatus === nextStatus) {
        // Cho phép cập nhật các trường khác nếu trạng thái không đổi
      } else if (!isValidStatusTransition(currentStatus, nextStatus)) {
        return res.status(400).json({
          msg: `Không thể chuyển trạng thái từ '${currentStatus}' sang '${nextStatus}'`,
        });
      }
    }
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ msg: "Không tìm thấy đơn" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Xoá đơn hàng */
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy đơn" });
    res.json({ msg: "Đã xoá đơn hàng" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrderWithDetails = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();
  try {
    const { orderDetails, ...orderData } = req.body;

    // Tạo order_code tự động (giống như createOrder)
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const dateStr = dd + mm + yyyy;
    const regex = new RegExp(`^ORDER(\\d{3})${dateStr}$`);
    const lastOrder = await Order.findOne({ order_code: { $regex: regex } }).sort({ order_code: -1 });
    let nextNumber = 1;
    if (lastOrder) {
      const match = lastOrder.order_code.match(/^ORDER(\d{3})/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const order_code = `ORDER${String(nextNumber).padStart(3, "0")}${dateStr}`;

    // Tạo Order
    const order = await Order.create([{ ...orderData, order_code }], { session });
    const orderId = order[0]._id;

    // Tạo các OrderDetail
    let total = 0;
    const details = [];
    for (const item of orderDetails) {
      const product = await Product.findById(item.product_id);
      if (!product) throw new Error("Không tìm thấy sản phẩm");
      const detailData = {
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price_each: product.price,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image_url,
      };
      total += product.price * item.quantity;
      const detail = await OrderDetail.create([detailData], { session });
      details.push(detail[0]);
    }

    // Cập nhật tổng tiền cho Order
    await Order.findByIdAndUpdate(orderId, { total_price: total }, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      order: { ...order[0].toObject(), total_price: total },
      orderDetails: details,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
};

// controllers/orderController.js

// Hủy đơn hàng
// controllers/orderController.js
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: "Đã hủy" }, // hoặc "cancelled"
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json({ message: "Hủy đơn hàng thành công", order: updatedOrder });
  } catch (error) {
    console.error("Lỗi huỷ đơn hàng:", error);
    res.status(500).json({ message: "Lỗi khi hủy đơn hàng" });
  }
};
