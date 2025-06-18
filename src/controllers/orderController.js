const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');

// Tạo đơn hàng
exports.createOrder = async (req, res) => {
  try {
    const {
      user_id,
      total_price,
      shipping_method,
      payment_method,
      shipping_address,
      orderDetails
    } = req.body;

    // Ép kiểu user_id
    const order = await Order.create({
      user_id: new mongoose.Types.ObjectId(user_id),
      total_price,
      shipping_method,
      payment_method,
      shipping_address
    });

    // Ép kiểu product_id trong từng chi tiết đơn hàng
    const details = orderDetails.map(item => ({
      order_id: order._id,
      product_id: new mongoose.Types.ObjectId(item.product_id),
      quantity: item.quantity,
      price_each: item.price_each
    }));

    await OrderDetail.insertMany(details);

    res.status(201).json({ message: 'Order created', order });
  } catch (err) {
    console.error(err); // Log chi tiết lỗi
    res.status(500).json({ error: err.message });
  }
};

// Lấy toàn bộ đơn hàng + chi tiết
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().lean();

    const results = await Promise.all(
      orders.map(async (order) => {
        const details = await OrderDetail.find({ order_id: order._id }).lean();
        return { ...order, details };
      })
    );

    res.json(results);
  } catch (err) {
    console.error(err); // Log lỗi nếu có
    res.status(500).json({ error: err.message });
  }
};
