const Payment = require("../models/payment");
const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const qs = require('qs');
const CartItem = require("../models/cartItem");
const Order  = require("../models/Order");

// Hàm helper để cập nhật trạng thái đơn hàng khi thanh toán online thành công
const updateOrderStatusAfterOnlinePayment = async (orderCode) => {
  try {
    // Chỉ cập nhật trạng thái thanh toán, KHÔNG thay đổi trạng thái đơn hàng
    const updatedOrder = await Order.findOneAndUpdate(
      { order_code: orderCode },
      { 
        payment_status: 'paid', 
        is_paid: true
        // KHÔNG cập nhật status và confirmed_at
      },
      { new: true }
    );
    
    if (updatedOrder) {
      console.log('Cập nhật trạng thái thanh toán thành công:', updatedOrder.order_code);
      return updatedOrder;
    } else {
      console.log('Không tìm thấy order với order_code:', orderCode);
      return null;
    }
  } catch (error) {
    console.log('Lỗi khi cập nhật trạng thái thanh toán:', error);
    return null;
  }
};

// Hàm xử lý thanh toán online thành công
exports.handleOnlinePaymentSuccess = async (req, res) => {
  try {
    const { order_code, payment_method, transaction_code, amount_paid } = req.body;
    
    if (!order_code || !payment_method || !amount_paid) {
      return res.status(400).json({
        success: false,
        msg: "Thiếu thông tin bắt buộc"
      });
    }

    // Lưu thông tin thanh toán
    const payment = await Payment.create({
      payment_id: `PAY${Date.now()}`,
      order_id: order_code,
      payment_method: payment_method.toUpperCase(),
      transaction_code: transaction_code || null,
      payment_status: 'success',
      amount_paid: amount_paid,
      note: `Thanh toán qua ${payment_method} thành công`,
      payment_date: new Date()
    });

    // Cập nhật trạng thái thanh toán (không thay đổi trạng thái đơn hàng)
    const updatedOrder = await updateOrderStatusAfterOnlinePayment(order_code);
    
    if (updatedOrder) {
      res.json({
        success: true,
        msg: "Xử lý thanh toán online thành công",
        data: {
          payment: payment,
          order: updatedOrder
        }
      });
    } else {
      res.status(404).json({
        success: false,
        msg: "Không tìm thấy đơn hàng để cập nhật"
      });
    }
  } catch (error) {
    console.error("Lỗi xử lý thanh toán online:", error);
    res.status(500).json({
      success: false,
      msg: "Lỗi server khi xử lý thanh toán online"
    });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { payment_id, order_id, payment_method, amount_paid, note } = req.body;
    const payment = new Payment({ payment_id, order_id, payment_method, amount_paid, note });
    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ payment_id: req.params.payment_id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { payment_method, transaction_code, payment_status, amount_paid, note } = req.body;
    const payment = await Payment.findOneAndUpdate(
      { payment_id: req.params.payment_id },
      { payment_method, transaction_code, payment_status, amount_paid, note, payment_date: Date.now() },
      { new: true, runValidators: true }
    );
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ payment_id: req.params.payment_id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// zalopayyyyy
const zaloConfig = {
  // app_id: '2554',
  // key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  // key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  // endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
  app_id: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  endpoint: process.env.ZALOPAY_ENDPOINT,
};

// 1. Tạo đơn hàng ZaloPay
exports.createZaloPayOrder = async (req, res) => {
  // Lấy dữ liệu từ frontend
  const cartId = req.body.cart_id;
  const orderCode = req.body.order_code;
  const cartItemIds = req.body.cart_item_ids || [];
  
  const embed_data = {
    cart_id: cartId,
    order_code: orderCode,
    cart_item_ids: cartItemIds
  };

  const items = req.body.items || [];
  const transID = Math.floor(Math.random() * 1000000);

  // Tính toán tổng tiền
  const productTotal = Number(req.body.product_total) || 0;
  const voucherDiscount = Number(req.body.voucher_discount) || 0;
  const shippingFee = Number(req.body.shipping_fee) || 0;
  const amount = productTotal - voucherDiscount + shippingFee;

  console.log("[ZaloPay] Tạo order - Cart ID:", cartId, "- Items:", cartItemIds.length, "- Tổng:", amount);

  // Kiểm tra dữ liệu đầu vào
  if (productTotal <= 0 || amount <= 0) {
    console.log("[ZaloPay] Lỗi: Số tiền thanh toán không hợp lệ!", { productTotal, voucherDiscount, shippingFee, amount });
    return res.status(400).json({ error: "Số tiền thanh toán không hợp lệ! Vui lòng kiểm tra lại dữ liệu gửi lên.", detail: { productTotal, voucherDiscount, shippingFee, amount } });
  }

  const order = {
    app_id: zaloConfig.app_id,
    app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
    app_user: req.body.app_user || 'user123',
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: amount,
    callback_url: 'https://747d7bec1e1d.ngrok-free.app/api/payments/zalopay/callback', // Đảm bảo đúng URL public
    description: `Thanh toán ZaloPay cho đơn hàng #${transID}`,
    bank_code: '',
  };

  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const data =
    zaloConfig.app_id +
    '|' +
    order.app_trans_id +
    '|' +
    order.app_user +
    '|' +
    order.amount +
    '|' +
    order.app_time +
    '|' +
    order.embed_data +
    '|' +
    order.item;
  order.mac = CryptoJS.HmacSHA256(data, zaloConfig.key1).toString();

  try {
    const result = await axios.post(zaloConfig.endpoint, null, { params: order });
    console.log("[ZaloPay] Tạo order thành công - App Trans ID:", order.app_trans_id);
    
    return res.status(200).json({
      ...result.data,
      qr_url: result.data.order_url,
      total_amount: amount,
      product_total: productTotal,
      voucher_discount: voucherDiscount,
      shipping_fee: shippingFee,
      app_trans_id: order.app_trans_id
    });

  } catch (error) {
    console.log("[ZaloPay] Lỗi tạo order:", error?.response?.data || error.message);
    return res.status(500).json({ error: 'Create ZaloPay order failed', detail: error?.response?.data || error });
  }
};

// 2. Callback từ ZaloPay
exports.zaloPayCallback = async (req, res) => {
  console.log(' ZaloPay callback được gọi');
  
  let result = {};
  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;
    let mac = CryptoJS.HmacSHA256(dataStr, zaloConfig.key2).toString();

    if (reqMac !== mac) {
      console.log(' MAC không khớp!');
      result.return_code = -1;
      result.return_message = 'mac not equal';
    } else {
      console.log(' MAC khớp - Xử lý thanh toán');
      
      let dataJson = JSON.parse(dataStr);

      // Lưu vào collection payments
      try {
        await Payment.create({
          payment_id: `PAY${dataJson['app_trans_id']}`,
          order_id: dataJson['app_trans_id'],
          payment_method: 'ZALOPAY',
          transaction_code: dataJson['zp_trans_id'] || null,
          payment_status: 'success',
          amount_paid: dataJson['amount'],
          note: 'Thanh toán qua ZaloPay thành công',
          payment_date: new Date()
        });
        console.log(' Lưu payment thành công');
        
        // Lấy order_code từ embed_data để cập nhật order
        let embedData = {};
        try {
          embedData = JSON.parse(dataJson.embed_data || '{}');
        } catch (e) {
          console.log(' Lỗi parse embed_data:', e);
        }
        
        const orderCode = embedData.order_code;
        
        if (orderCode) {
          // Cập nhật trạng thái thanh toán của order
          const updatedOrder = await updateOrderStatusAfterOnlinePayment(orderCode);
          
          if (updatedOrder) {
            console.log(' Cập nhật order thành công');
          } else {
            console.log(' Không tìm thấy order với order_code:', orderCode);
          }
        }
      } catch (err) {
        console.log(' Lỗi khi lưu payment:', err.message);
      }

      // Xóa cart items đã thanh toán sau khi thanh toán thành công
      try {
        let embedData = {};
        try {
          embedData = JSON.parse(dataJson.embed_data || '{}');
        } catch (e) {
          console.log(' Lỗi parse embed_data:', e);
          return;
        }

        const cartId = embedData.cart_id;
        const cartItemIds = embedData.cart_item_ids || [];
        
        if (cartItemIds && cartItemIds.length > 0) {
          // Chỉ xóa những cart items đã thanh toán
          const existingItems = await CartItem.find({ _id: { $in: cartItemIds } });
          
          if (existingItems.length > 0) {
            const deleteResult = await CartItem.deleteMany({ 
              _id: { $in: cartItemIds } 
            });
            console.log(` Đã xóa ${deleteResult.deletedCount} sản phẩm khỏi giỏ hàng`);
          } else {
            console.log(' Không tìm thấy sản phẩm nào để xóa');
          }
          
        } else if (cartId) {
          // Fallback: xóa toàn bộ giỏ hàng
          const deleteResult = await CartItem.deleteMany({ cart_id: cartId });
          console.log(` Xóa toàn bộ giỏ hàng: ${deleteResult.deletedCount} sản phẩm`);
        }
      } catch (cartError) {
        console.log(' Lỗi khi xóa sản phẩm:', cartError.message);
      }

      result.return_code = 1;
      result.return_message = 'success';
    }
    
    console.log(' Xử lý callback thành công');
  } catch (ex) {
    result.return_code = 0;
    result.return_message = ex.message;
    console.log(' Lỗi callback:', ex.message);
  }
  res.json(result);
};

// 3. Kiểm tra trạng thái đơn hàng ZaloPay
exports.checkZaloPayOrderStatus = async (req, res) => {
  const { app_trans_id } = req.body;
  if (!app_trans_id) {
    return res.status(400).json({ error: 'Thiếu app_trans_id!' });
  }

  let postData = {
    app_id: zaloConfig.app_id,
    app_trans_id,
  };

  let data = postData.app_id + '|' + postData.app_trans_id + '|' + zaloConfig.key1;
  postData.mac = CryptoJS.HmacSHA256(data, zaloConfig.key1).toString();

  let postConfig = {
    method: 'post',
    url: 'https://sb-openapi.zalopay.vn/v2/query',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify(postData),
  };

  try {
    const result = await axios(postConfig);
    if (result.data.return_code !== 1) {
      console.log('ZaloPay check status error:', result.data);
    }
    return res.status(200).json(result.data);
  } catch (error) {
    console.log('Lỗi khi kiểm tra trạng thái ZaloPay:', error?.response?.data || error);
    return res.status(500).json({ error: 'Check ZaloPay order status failed', detail: error?.response?.data });
  }
};

// Tính toán voucher discount cho thanh toán online
exports.calculateVoucherForPayment = async (req, res) => {
  try {
    const { voucher_id, product_total } = req.body;

    if (!product_total) {
      return res.status(400).json({
        success: false,
        msg: "Thiếu product_total"
      });
    }

    let voucherDiscount = 0;
    let voucherInfo = null;

    if (voucher_id) {
      const Voucher = require("../models/Voucher");
      const voucher = await Voucher.findById(voucher_id);

      if (!voucher) {
        return res.status(400).json({
          success: false,
          msg: "Voucher không hợp lệ"
        });
      }

      // Kiểm tra voucher có hợp lệ không
      if (voucher.status !== 'active') {
        return res.status(400).json({
          success: false,
          msg: "Voucher không còn hiệu lực"
        });
      }

      if (new Date(voucher.expiry_date) < new Date()) {
        return res.status(400).json({
          success: false,
          msg: "Voucher đã hết hạn"
        });
      }

      if (voucher.usage_limit <= voucher.used_count) {
        return res.status(400).json({
          success: false,
          msg: "Voucher đã hết lượt sử dụng"
        });
      }

      // Tính toán discount
      voucherDiscount = voucher.discount_value;

      voucherInfo = {
        voucher_id: voucher_id,
        discount_value: voucher.discount_value,
        expiry_date: voucher.expiry_date,
        usage_limit: voucher.usage_limit,
        used_count: voucher.used_count
      };
    }

    const finalTotal = Math.max(0, product_total - voucherDiscount);

    res.json({
      success: true,
      data: {
        product_total: product_total,
        voucher_discount: voucherDiscount,
        final_total: finalTotal,
        voucher_info: voucherInfo
      }
    });
  } catch (error) {
    console.error("Error calculating voucher for payment:", error);
    res.status(500).json({
      success: false,
      msg: "Lỗi server khi tính toán voucher"
    });
  }
};