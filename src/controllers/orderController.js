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
    const { user_id, total_price, shippingmethod_id, paymentmethod_id, voucher_ids, shipping_address, note } = req.body;

    // Validation
    if (!user_id || !total_price || !shippingmethod_id || !paymentmethod_id || !shipping_address) {
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
    const paymentMethodForOrder = await PaymentMethod.findById(paymentmethod_id);
    if (!paymentMethodForOrder) {
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
      voucher_ids,
      shipping_address,
      note,
      order_code,
    }], { session });

    const orderId = order[0]._id;

    // Kiểm tra nếu là thanh toán online thì cập nhật trạng thái thanh toán
    const paymentMethodForOnline = await PaymentMethod.findById(paymentmethod_id);
    if (paymentMethodForOnline && paymentMethodForOnline.code && ['ZALOPAY'].includes(paymentMethodForOnline.code.toUpperCase())) {
      // Đây là thanh toán online, chỉ cập nhật trạng thái thanh toán
      // KHÔNG thay đổi trạng thái đơn hàng (vẫn ở "Chờ xử lý")
      await Order.findByIdAndUpdate(
        orderId,
        { 
          payment_status: 'paid',
          is_paid: true
          // KHÔNG cập nhật status và confirmed_at
          // Đơn hàng vẫn ở trạng thái "Chờ xử lý" cho đến khi nhân viên xác nhận
        },
        { session }
      );
      console.log('Đã cập nhật trạng thái thanh toán cho đơn hàng online:', order_code);
    }

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
      .populate("user_id", "name email phone_number")
      .populate("shippingmethod_id", "name fee estimated_days")
      .populate("paymentmethod_id", "name code")
      .populate("voucher_ids", "name title discount_value voucher_id")
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
          // Thêm field mới để hiển thị tổng số lượng sản phẩm thực tế
          orderObj.total_quantity = orderDetails.reduce((total, detail) => total + (detail.quantity || 0), 0);

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
      .populate("user_id", "name email phone_number address")
      .populate("shippingmethod_id", "name fee description estimated_days")
      .populate("paymentmethod_id", "name description code")
      .populate("voucher_ids", "name title discount_value voucher_id");

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
    // Thêm field mới để hiển thị tổng số lượng sản phẩm thực tế
    orderObj.total_quantity = orderDetails.reduce((total, detail) => total + (detail.quantity || 0), 0);

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
      .populate("user_id", "name email phone_number")
      .populate("shippingmethod_id", "name fee estimated_days")
      .populate("paymentmethod_id", "name code")
      .populate("voucher_ids", "name title discount_value voucher_id")
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
        // Thêm field mới để hiển thị tổng số lượng sản phẩm thực tế
        orderObj.total_quantity = orderDetails.reduce((total, detail) => total + (detail.quantity || 0), 0);
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
    "Đang vận chuyển": ["Đã hủy"], // Không cho phép admin chuyển sang "Đã giao hàng"
    "Đã giao hàng": ["Hoàn thành", "Đã hủy"],
    "Hoàn thành": [],
    "Đã hủy": [],
  };
  return transitions[current]?.includes(next);
}

// Hàm cập nhật thời gian theo trạng thái
function getStatusUpdateData(currentStatus, newStatus, paymentMethodCode = null) {
  const updateData = {};
  
  switch (newStatus) {
    case "Đã xác nhận":
      updateData.confirmed_at = new Date();
      // Chỉ cập nhật payment_status thành "paid" nếu là thanh toán online
      // Với COD, payment_status vẫn là "pending" cho đến khi khách hàng thanh toán
      if (paymentMethodCode && ['ZALOPAY', 'VNPAY', 'MOMO'].includes(paymentMethodCode.toUpperCase())) {
        updateData.payment_status = "paid";
      }
      // Không cập nhật payment_status cho COD
      break;
    case "Đang vận chuyển":
      updateData.shipped_at = new Date();
      updateData.shipping_status = "shipped";
      break;
    case "Đã giao hàng":
      updateData.delivered_at = new Date();
      updateData.shipping_status = "delivered";
      // Với COD, tự động cập nhật payment_status thành "paid" khi giao hàng
      if (paymentMethodCode && paymentMethodCode.toUpperCase() === 'COD') {
        updateData.payment_status = "paid";
        updateData.is_paid = true;
      }
      break;
    case "Hoàn thành":
      updateData.shipping_status = "delivered";
      // Với COD, tự động cập nhật payment_status thành "paid" nếu chưa được cập nhật
      if (paymentMethodCode && paymentMethodCode.toUpperCase() === 'COD') {
        updateData.payment_status = "paid";
        updateData.is_paid = true;
      }
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

      // Lấy thông tin phương thức thanh toán để xác định logic cập nhật payment_status
      let paymentMethodCode = null;
      if (order.paymentmethod_id && typeof order.paymentmethod_id === 'object' && order.paymentmethod_id.code) {
        paymentMethodCode = order.paymentmethod_id.code;
      } else if (order.paymentmethod_id) {
        // Nếu paymentmethod_id là string, cần populate để lấy code
        const PaymentMethod = require("../models/PaymentMethod");
        const paymentMethod = await PaymentMethod.findById(order.paymentmethod_id);
        if (paymentMethod) {
          paymentMethodCode = paymentMethod.code;
        }
      }

      // Cập nhật thời gian theo trạng thái và phương thức thanh toán
      const statusUpdateData = getStatusUpdateData(currentStatus, nextStatus, paymentMethodCode);
      Object.assign(updateData, statusUpdateData);
    }

    const updated = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("user_id", "name email phone_number")
      .populate("shippingmethod_id", "name")
      .populate("paymentmethod_id", "name code");

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

// Hàm cập nhật trạng thái thanh toán khi thanh toán online thành công
exports.updatePaymentStatusForOnlinePayment = async (req, res) => {
  try {
    const { order_code, payment_method } = req.body;
    
    if (!order_code || !payment_method) {
      return res.status(400).json({
        success: false,
        msg: "Thiếu thông tin bắt buộc"
      });
    }

    // Tìm và cập nhật đơn hàng - chỉ cập nhật trạng thái thanh toán
    const updatedOrder = await Order.findOneAndUpdate(
      { order_code: order_code },
      { 
        payment_status: 'paid',
        is_paid: true
        // KHÔNG cập nhật status và confirmed_at
        // Đơn hàng vẫn ở trạng thái "Chờ xử lý" cho đến khi nhân viên xác nhận
      },
      { new: true }
    ).populate("user_id", "name email phone_number")
     .populate("shippingmethod_id", "name")
     .populate("paymentmethod_id", "name code");

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        msg: "Không tìm thấy đơn hàng"
      });
    }

    res.json({
      success: true,
      msg: "Cập nhật trạng thái thanh toán thành công",
      data: updatedOrder
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái thanh toán:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi cập nhật trạng thái thanh toán"
    });
  }
};

// Hàm cập nhật trạng thái thanh toán cho đơn hàng COD khi khách hàng thanh toán
exports.updatePaymentStatusForCOD = async (req, res) => {
  try {
    const { order_id } = req.params;
    
    if (!order_id) {
      return res.status(400).json({
        success: false,
        msg: "Thiếu order_id"
      });
    }

    // Tìm đơn hàng và kiểm tra phương thức thanh toán
    const order = await Order.findById(order_id)
      .populate("paymentmethod_id", "name code");

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: "Không tìm thấy đơn hàng"
      });
    }

    // Kiểm tra xem có phải đơn hàng COD không
    if (!order.paymentmethod_id || typeof order.paymentmethod_id !== 'object' || 
        order.paymentmethod_id.code?.toUpperCase() !== 'COD') {
      return res.status(400).json({
        success: false,
        msg: "Chỉ có thể cập nhật trạng thái thanh toán cho đơn hàng COD"
      });
    }

    // Kiểm tra xem đơn hàng đã được giao chưa
    if (order.status !== "Đã giao hàng" && order.status !== "Hoàn thành") {
      return res.status(400).json({
        success: false,
        msg: "Chỉ có thể cập nhật trạng thái thanh toán khi đơn hàng đã được giao"
      });
    }

    // Cập nhật trạng thái thanh toán
    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      { 
        payment_status: 'paid',
        is_paid: true
      },
      { new: true }
    ).populate("user_id", "name email phone_number")
     .populate("shippingmethod_id", "name")
     .populate("paymentmethod_id", "name code");

    res.json({
      success: true,
      msg: "Cập nhật trạng thái thanh toán COD thành công",
      data: updatedOrder
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái thanh toán COD:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi cập nhật trạng thái thanh toán COD"
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

    // Xử lý voucher nếu có//
    let finalTotalPrice = orderData.total_price;
    let voucherInfo = null;
    
if (Array.isArray(orderData.voucher_ids) && orderData.voucher_ids.length > 0) {
  const Voucher = require("../models/Voucher");
  const vouchers = await Voucher.find({ _id: { $in: orderData.voucher_ids } });

  let totalDiscount = 0;
  for (const voucher of vouchers) {
    if (voucher.status !== 'active') continue;
    if (new Date(voucher.expiry_date) < new Date()) continue;
    if (voucher.usage_limit <= voucher.used_count) continue;

    totalDiscount += voucher.discount_value;
    voucher.used_count += 1;
    await voucher.save({ session });
  }
  finalTotalPrice = Math.max(0, orderData.total_price - totalDiscount);
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

    // Tạo Order với total_price đã được tính toán
    const order = await Order.create([{ 
      ...orderData, 
      total_price: finalTotalPrice,
      order_code 
    }], {
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

    // Kiểm tra nếu là thanh toán online thì cập nhật trạng thái thanh toán
    const paymentMethodForOnline = await PaymentMethod.findById(orderData.paymentmethod_id);
    if (paymentMethodForOnline && paymentMethodForOnline.code && ['ZALOPAY', 'VNPAY', 'MOMO'].includes(paymentMethodForOnline.code.toUpperCase())) {
      // Đây là thanh toán online, chỉ cập nhật trạng thái thanh toán
      // KHÔNG thay đổi trạng thái đơn hàng (vẫn ở "Chờ xử lý")
      await Order.findByIdAndUpdate(
        orderId,
        { 
          payment_status: 'paid',
          is_paid: true
          // KHÔNG cập nhật status và confirmed_at
          // Đơn hàng vẫn ở trạng thái "Chờ xử lý" cho đến khi nhân viên xác nhận
        },
        { session }
      );
      console.log('Đã cập nhật trạng thái thanh toán cho đơn hàng online:', order_code);
    }

    // Không cập nhật lại total_price nữa, dùng giá client gửi

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      msg: "Tạo đơn hàng thành công",
      data: {
        order: order[0],
        orderDetails: details,
        voucherInfo: voucherInfo
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

// API để người dùng xác nhận đã nhận hàng
exports.confirmOrderReceived = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { user_id } = req.body; // user_id để xác thực người dùng
    
    console.log('🔍 Confirm order received - order_id:', order_id);
    console.log('🔍 Confirm order received - user_id:', user_id);
    console.log('🔍 Confirm order received - body:', req.body);
    console.log('🔍 Confirm order received - params:', req.params);
    console.log('🔍 Confirm order received - method:', req.method);
    console.log('🔍 Confirm order received - url:', req.url);
    
    if (!order_id || !user_id) {
      return res.status(400).json({
        success: false,
        msg: "Thiếu thông tin bắt buộc: order_id hoặc user_id",
        received: { order_id, user_id, body: req.body, params: req.params }
      });
    }

    const order = await Order.findById(order_id)
      .populate("paymentmethod_id", "name code");

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: "Không tìm thấy đơn hàng",
        order_id: order_id
      });
    }

    console.log('🔍 Order found - current status:', order.status);
    console.log('🔍 Order found - user_id:', order.user_id);
    console.log('🔍 Order found - payment method:', order.paymentmethod_id);

    // Kiểm tra xem đơn hàng có thuộc về user này không
    if (order.user_id.toString() !== user_id) {
      return res.status(403).json({
        success: false,
        msg: "Bạn không có quyền xác nhận đơn hàng này",
        order_user_id: order.user_id.toString(),
        request_user_id: user_id
      });
    }

    // Kiểm tra xem đơn hàng có đang ở trạng thái "Đang vận chuyển" không
    if (order.status !== "Đang vận chuyển") {
      return res.status(400).json({
        success: false,
        msg: `Chỉ có thể xác nhận đã nhận hàng khi đơn hàng đang vận chuyển. Trạng thái hiện tại: ${order.status}`,
        current_status: order.status,
        required_status: "Đang vận chuyển"
      });
    }

    // Cập nhật trạng thái đơn hàng thành "Đã giao hàng"
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

    console.log('🔍 Updating order with data:', updateData);

    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      updateData,
      { new: true }
    ).populate("user_id", "name email phone_number")
     .populate("shippingmethod_id", "name")
     .populate("paymentmethod_id", "name code");

    console.log('✅ Order updated successfully:', updatedOrder._id);

    res.json({
      success: true,
      msg: "Xác nhận đã nhận hàng thành công",
      data: updatedOrder
    });
  } catch (error) {
    console.error("❌ Lỗi xác nhận đã nhận hàng:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi xác nhận đã nhận hàng",
      details: error.message
    });
  }
};
