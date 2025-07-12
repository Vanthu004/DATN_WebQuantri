const OrderDetail = require("../models/orderDetail");
const Product = require("../models/product");
const Order = require("../models/Order");

/* Thêm chi tiết đơn hàng */
exports.createOrderDetail = async (req, res) => {
  try {
    // Lấy thông tin sản phẩm tại thời điểm mua
    const product = await Product.findById(req.body.product_id);
    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }
    // Gán thông tin sản phẩm vào order detail
    const detailData = {
      ...req.body,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image_url,
      price_each: product.price, // Đảm bảo giá từng cái đúng
    };
    const detail = await OrderDetail.create(detailData);
    // Sau khi tạo, cập nhật lại tổng tiền cho Order
    await updateOrderTotalPrice(detail.order_id);
    res.status(201).json(detail);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả chi tiết đơn hàng */
exports.getAllOrderDetails = async (_req, res) => {
  try {
    const list = await OrderDetail.find().populate("order_id", "order_id");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy chi tiết theo ID */
exports.getOrderDetailById = async (req, res) => {
  try {
    const detail = await OrderDetail.findById(req.params.id);
    if (!detail)
      return res.status(404).json({ msg: "Không tìm thấy chi tiết" });
    res.json(detail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy tất cả chi tiết theo order_id */
exports.getByOrderId = async (req, res) => {
  try {
    const list = await OrderDetail.find({ order_id: req.params.orderId });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Xoá chi tiết */
exports.deleteOrderDetail = async (req, res) => {
  try {
    const deleted = await OrderDetail.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ msg: "Không tìm thấy chi tiết" });
    // Sau khi xóa, cập nhật lại tổng tiền cho Order
    await updateOrderTotalPrice(deleted.order_id);
    res.json({ msg: "Đã xoá chi tiết đơn hàng" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Xem chi tiết order detail (kèm thông tin order và variant) */
exports.getOrderDetailFullById = async (req, res) => {
  try {
    const detail = await OrderDetail.findById(req.params.id).populate(
      "order_id"
    );
    if (!detail)
      return res.status(404).json({ msg: "Không tìm thấy chi tiết" });
    res.json(detail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hàm cập nhật tổng tiền cho Order
async function updateOrderTotalPrice(orderId) {
  const details = await OrderDetail.find({ order_id: orderId });
  const total = details.reduce((sum, d) => sum + (d.price_each * d.quantity), 0);
  await Order.findByIdAndUpdate(orderId, { total_price: total });
}
