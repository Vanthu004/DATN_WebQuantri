// src/cron/orderAutoDeliveryCron.js
const cron = require('node-cron');
const Order = require('../models/Order');

// Cấu hình thời gian tự động cập nhật (có thể thay đổi)
const AUTO_DELIVERY_DELAY_HOURS = process.env.AUTO_DELIVERY_DELAY_HOURS || 24; // Mặc định 24 giờ

// Tự động cập nhật trạng thái đơn hàng sang "Đã giao hàng"
const autoUpdateOrderStatus = async () => {
  try {
    console.log('🔄 Running auto update order status...');
    
    // Tính thời gian giới hạn (bao nhiêu giờ trước)
    const timeLimit = new Date(Date.now() - AUTO_DELIVERY_DELAY_HOURS * 60 * 60 * 1000);
    
    // Tìm đơn hàng đang vận chuyển và đã được tạo trước thời gian giới hạn
    const ordersToUpdate = await Order.find({
      status: "Đang vận chuyển",
      shipped_at: { $lt: timeLimit }, // shipped_at < timeLimit
      // Chỉ cập nhật những đơn hàng chưa được giao
      delivered_at: { $exists: false }
    });

    console.log(`📦 Found ${ordersToUpdate.length} orders to auto-update`);

    for (const order of ordersToUpdate) {
      try {
        // Cập nhật trạng thái đơn hàng
        const updateData = {
          status: "Đã giao hàng",
          delivered_at: new Date(),
          shipping_status: "delivered"
        };

        // Nếu là COD, tự động cập nhật payment_status
        if (order.paymentmethod_id && typeof order.paymentmethod_id === 'object' && 
            order.paymentmethod_id.code?.toUpperCase() === 'COD') {
          updateData.payment_status = "paid";
          updateData.is_paid = true;
        }

        await Order.findByIdAndUpdate(order._id, updateData);
        
        console.log(`✅ Auto-updated order ${order.order_code} to "Đã giao hàng"`);
      } catch (error) {
        console.error(`❌ Error updating order ${order.order_code}:`, error);
      }
    }

    console.log(`✅ Auto-updated ${ordersToUpdate.length} orders successfully`);
  } catch (error) {
    console.error('❌ Auto update order status error:', error);
  }
};

// Setup cron jobs
const startOrderAutoDeliveryCronJobs = () => {
  // Chạy mỗi giờ để kiểm tra và cập nhật trạng thái đơn hàng
  cron.schedule('0 * * * *', autoUpdateOrderStatus);
  
  console.log(`✅ Order auto-delivery cron jobs started (delay: ${AUTO_DELIVERY_DELAY_HOURS} hours)`);
};

module.exports = { 
  startOrderAutoDeliveryCronJobs, 
  autoUpdateOrderStatus,
  AUTO_DELIVERY_DELAY_HOURS 
};
