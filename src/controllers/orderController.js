const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Product = require("../models/product");
const ProductVariant = require("../models/productVariant");
const ShippingMethod = require("../models/ShippingMethod");
const PaymentMethod = require("../models/PaymentMethod");

/* Tạo đơn hàng mới */
exports.createOrder = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();
  
  try {
    const { user_id, total_price, shippingmethod_id, paymentmethod_id, voucher_id, shipping_address, note } = req.body;

    // Validation
    if (!user_id || !total_price || !shippingmethod_id || !paymentmethod_id || !voucher_id || !shipping_address) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu thông tin bắt buộc" 
      });
    }

    if (total_price <= 0) {
      return res.status(400).json({ 
        success: false,
        msg: "Tổng tiền phải lớn hơn 0" 
      });
    }

    // Validate shipping method
    const shippingMethod = await ShippingMethod.findById(shippingmethod_id);
    if (!shippingMethod) {
      return res.status(400).json({
        success: false,
        msg: "Phương thức vận chuyển không hợp lệ"
      });
    }

    // Validate payment method
    const paymentMethod = await PaymentMethod.findById(paymentmethod_id);
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        msg: "Phương thức thanh toán không hợp lệ"
      });
    }

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
    const order = await Order.create([{
      user_id,
      total_price,
      shippingmethod_id,
      paymentmethod_id,
      voucher_id,
      shipping_address,
      note,
      order_code,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      msg: "Tạo đơn hàng thành công",
      data: order[0]
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating order:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi tạo đơn hàng" 
    });
  }
};

/* Lấy tất cả đơn hàng */
exports.getAllOrders = async (req, res) => {
  try {
    const { status, payment_status, shipping_status, page = 1, limit = 10, sort = "-createdAt" } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (payment_status) query.payment_status = payment_status;
    if (shipping_status) query.shipping_status = shipping_status;

    const skip = (page - 1) * limit;
    
    // Xử lý sort parameter để tránh lỗi
    let sortOption = "-createdAt"; // default
    if (sort) {
      // Loại bỏ phần :1 nếu có (ví dụ: -createdAt:1 -> -createdAt)
      sortOption = sort.split(':')[0];
      
      // Validate sort field
      const allowedSortFields = ['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'total_price', '-total_price', 'order_code', '-order_code'];
      if (!allowedSortFields.includes(sortOption)) {
        sortOption = "-createdAt"; // fallback to default
      }
    }
    
    console.log('Query:', query);
    console.log('Sort option:', sortOption);
    
    const orders = await Order.find(query)
      .populate("user_id", "name email phone")
      .populate("shippingmethod_id", "name fee")
      .populate("paymentmethod_id", "name")
      .populate("voucher_id", "name title discount_value")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    console.log('Found orders:', orders.length);

    // Tính toán item_count và has_variants cho mỗi order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          const orderDetails = await OrderDetail.find({ 
            order_id: order._id, 
            status: "active" 
          });
          
          const orderObj = order.toObject();
          orderObj.item_count = orderDetails.length;
          orderObj.has_variants = orderDetails.some(detail => detail.product_variant_id);
          
          return orderObj;
        } catch (detailError) {
          console.error('Error processing order details for order:', order._id, detailError);
          const orderObj = order.toObject();
          orderObj.item_count = 0;
          orderObj.has_variants = false;
          return orderObj;
        }
      })
    );

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders: ordersWithDetails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error("Error getting all orders:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy danh sách đơn hàng",
      details: err.message
    });
  }
};

/* Lấy đơn hàng theo ID */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu order_id" 
      });
    }

    const order = await Order.findById(id)
      .populate("user_id", "name email phone address")
      .populate("shippingmethod_id", "name fee description")
      .populate("paymentmethod_id", "name description")
      .populate("voucher_id", "name title discount_value");

    if (!order) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy đơn hàng" 
      });
    }

    // Tính toán item_count và has_variants
    const orderDetails = await OrderDetail.find({ 
      order_id: order._id, 
      status: "active" 
    });
    
    const orderObj = order.toObject();
    orderObj.item_count = orderDetails.length;
    orderObj.has_variants = orderDetails.some(detail => detail.product_variant_id);

    res.json({
      success: true,
      data: orderObj
    });
  } catch (err) {
    console.error("Error getting order by id:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy thông tin đơn hàng" 
    });
  }
};

/* Lấy đơn hàng của 1 user */
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu user_id" 
      });
    }

    let query = { user_id: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate("shippingmethod_id", "name fee")
      .populate("paymentmethod_id", "name")
      .populate("voucher_id", "name title discount_value")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Tính toán item_count và has_variants cho mỗi order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderDetails = await OrderDetail.find({ 
          order_id: order._id, 
          status: "active" 
        });
        
        const orderObj = order.toObject();
        orderObj.item_count = orderDetails.length;
        orderObj.has_variants = orderDetails.some(detail => detail.product_variant_id);
        
        return orderObj;
      })
    );

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders: ordersWithDetails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error("Error getting orders by user:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy đơn hàng của user" 
    });
  }
};

// Hàm kiểm tra hợp lệ khi chuyển trạng thái đơn hàng
function isValidStatusTransition(current, next) {
  const transitions = {
    "Chờ xử lý": ["Đã xác nhận", "Đã hủy"],
    "Đã xác nhận": ["Đang vận chuyển", "Đã hủy"],
    "Đang vận chuyển": ["Đã giao hàng", "Đã hủy"],
    "Đã giao hàng": ["Hoàn thành", "Đã hủy"],
    "Hoàn thành": [],
    "Đã hủy": [],
  };
  return transitions[current]?.includes(next);
}

// Hàm cập nhật thời gian theo trạng thái
function getStatusUpdateData(currentStatus, newStatus) {
  const updateData = {};
  
  switch (newStatus) {
    case "Đã xác nhận":
      updateData.confirmed_at = new Date();
      updateData.payment_status = "paid";
      break;
    case "Đang vận chuyển":
      updateData.shipped_at = new Date();
      updateData.shipping_status = "shipped";
      break;
    case "Đã giao hàng":
      updateData.delivered_at = new Date();
      updateData.shipping_status = "delivered";
      break;
    case "Hoàn thành":
      updateData.shipping_status = "delivered";
      updateData.payment_status = "paid";
      break;
    case "Đã hủy":
      updateData.cancelled_at = new Date();
      updateData.payment_status = "refunded";
      updateData.shipping_status = "returned";
      break;
  }
  
  return updateData;
}

/* Cập nhật đơn hàng */
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (!id) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu order_id" 
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy đơn hàng" 
      });
    }

    // Nếu có cập nhật trạng thái
    if (updateData.status) {
      const currentStatus = order.status;
      const nextStatus = updateData.status;
      
      if (currentStatus === nextStatus) {
        // Cho phép cập nhật các trường khác nếu trạng thái không đổi
      } else if (!isValidStatusTransition(currentStatus, nextStatus)) {
        return res.status(400).json({
          success: false,
          msg: `Không thể chuyển trạng thái từ '${currentStatus}' sang '${nextStatus}'`,
        });
      }

      // Cập nhật thời gian theo trạng thái
      const statusUpdateData = getStatusUpdateData(currentStatus, nextStatus);
      Object.assign(updateData, statusUpdateData);
    }

    const updated = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("user_id", "name email")
      .populate("shippingmethod_id", "name")
      .populate("paymentmethod_id", "name");

    res.json({
      success: true,
      msg: "Cập nhật đơn hàng thành công",
      data: updated
    });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi cập nhật đơn hàng" 
    });
  }
};

/* Xoá đơn hàng (soft delete) */
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu order_id" 
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy đơn hàng" 
      });
    }

    // Chỉ cho phép xóa đơn hàng đã hủy hoặc hoàn thành
    if (!["Đã hủy", "Hoàn thành"].includes(order.status)) {
      return res.status(400).json({ 
        success: false,
        msg: "Chỉ có thể xóa đơn hàng đã hủy hoặc hoàn thành" 
      });
    }

    // Soft delete - cập nhật trạng thái thành "Đã hủy"
    const deleted = await Order.findByIdAndUpdate(
      id,
      { 
        status: "Đã hủy",
        cancelled_at: new Date(),
        payment_status: "refunded",
        shipping_status: "returned"
      },
      { new: true }
    );

    res.json({
      success: true,
      msg: "Đã xoá đơn hàng"
    });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi xóa đơn hàng" 
    });
  }
};

exports.createOrderWithDetails = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();
  try {
    const { orderDetails, ...orderData } = req.body;

    // Validation
    if (!orderDetails || !Array.isArray(orderDetails) || orderDetails.length === 0) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu thông tin chi tiết đơn hàng" 
      });
    }

    if (typeof orderData.total_price !== "number" || orderData.total_price < 0) {
      return res.status(400).json({
        success: false,
        msg: "Thiếu hoặc sai định dạng tổng tiền đơn hàng (total_price)"
      });
    }

    // Tạo order_code tự động
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const dateStr = dd + mm + yyyy;
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

    // Tạo Order, dùng total_price do client gửi lên
    const order = await Order.create([{ ...orderData, order_code }], {
      session,
    });
    const orderId = order[0]._id;

    // Tạo các OrderDetail
    const details = [];

    for (const item of orderDetails) {
      let product = null;
      let variant = null;
      let variantInfo = null;

      if (item.product_variant_id) {
        variant = await ProductVariant.findById(item.product_variant_id)
          .populate('attributes.size')
          .populate('attributes.color');
        if (!variant) {
          throw new Error("Không tìm thấy biến thể sản phẩm");
        }
        product = await Product.findById(variant.product_id);

        variantInfo = {
          size: variant.attributes.size ? {
            _id: variant.attributes.size._id,
            name: variant.attributes.size.name
          } : null,
          color: variant.attributes.color ? {
            _id: variant.attributes.color._id,
            name: variant.attributes.color.name
          } : null,
          sku: variant.sku
        };
      } else {
        product = await Product.findById(item.product_id);
      }

      if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
      }

      const detailData = {
        order_id: orderId,
        product_id: product._id,
        product_variant_id: item.product_variant_id || null,
        quantity: item.quantity,
        price_each: variant ? variant.price : product.price,
        product_name: product.name,
        product_price: product.price,
        product_image: variant ? variant.image_url : product.image_url,
        variant_info: variantInfo
      };

      const detail = await OrderDetail.create([detailData], { session });
      details.push(detail[0]);

      // Tăng sold_quantity cho sản phẩm
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { sold_quantity: item.quantity } },
        { session }
      );
    }

    // Không cập nhật lại total_price nữa, dùng giá client gửi

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      msg: "Tạo đơn hàng thành công",
      data: {
        order: order[0], // giữ nguyên total_price đã lưu
        orderDetails: details,
      }
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating order with details:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi tạo đơn hàng"
    });
  }
};


// Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Nếu đã hoàn thành thì không cho hủy
    if (order.status === "Hoàn thành")
      return res
        .status(400)
        .json({ message: "Đơn hàng đã hoàn thành, không thể hủy" });

    order.status = "Đã hủy";
    order.cancel_reason = reason;
    await order.save();

    res.json({ message: "Đã hủy đơn hàng thành công", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
