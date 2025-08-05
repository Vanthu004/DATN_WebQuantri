const Payment = require("../models/payment");
const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const qs = require('qs');
const CartItem = require("../models/cartItem");

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
  // Log dữ liệu nhận từ frontend
  console.log("[ZaloPay] Received from FE:", req.body);
  
  // Lấy cart_id từ frontend và thêm vào embed_data
  const cartId = req.body.cart_id;
  const embed_data = { 
    cart_id: cartId // Thêm cart_id vào embed_data để callback có thể lấy
  };
  
  const items = req.body.items || [];
  const transID = Math.floor(Math.random() * 1000000);

  // Lấy từng trường riêng biệt
  const productTotal = Number(req.body.product_total) || 0;
  const voucherDiscount = Number(req.body.voucher_discount) || 0;
  const shippingFee = Number(req.body.shipping_fee) || 0;
  const amount = productTotal - voucherDiscount + shippingFee;

  // Log chi tiết các giá trị
  console.log("[ZaloPay] Tổng tiền chi tiết:", { productTotal, voucherDiscount, shippingFee, amount });
  console.log("[ZaloPay] Cart ID:", cartId);

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
    callback_url: 'https://1b22efdef50c.ngrok-free.app/api/payments/zalopay/callback', // Đảm bảo đúng URL public
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

  // Log dữ liệu gửi sang ZaloPay
  console.log("[ZaloPay] Send to ZaloPay:", order);

  try {
    const result = await axios.post(zaloConfig.endpoint, null, { params: order });
    // Log response trả về từ ZaloPay
    console.log("[ZaloPay] Response from ZaloPay:", result.data);
    return res.status(200).json({
      ...result.data,
      qr_url: result.data.order_url,
      total_amount: amount,
      product_total: productTotal,
      voucher_discount: voucherDiscount,
      shipping_fee: shippingFee,
      app_trans_id: order.app_trans_id // trả về để kiểm tra trạng thái sau này
    });
  } catch (error) {
    console.log("[ZaloPay] Error from ZaloPay:", error?.response?.data || error);
    return res.status(500).json({ error: 'Create ZaloPay order failed', detail: error?.response?.data || error });
  }
};

// 2. Callback từ ZaloPay
exports.zaloPayCallback = async (req, res) => {
  let result = {};
  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;
    let mac = CryptoJS.HmacSHA256(dataStr, zaloConfig.key2).toString();

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = 'mac not equal';
    } else {
      let dataJson = JSON.parse(dataStr);

      // Thêm log trước khi lưu
      console.log('ZaloPay callback data:', dataJson);

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
        console.log('Lưu payment ZALOPAY thành công!');
      } catch (err) {
        console.log('Lỗi khi lưu payment ZALOPAY:', err);
      }

      // Xóa cart items sau khi thanh toán thành công
      try {
        // Lấy cart_id từ embed_data
        let embedData = {};
        try {
          embedData = JSON.parse(dataJson.embed_data || '{}');
        } catch (e) {
          console.log('Lỗi parse embed_data:', e);
        }
        
        const cartId = embedData.cart_id;
        console.log('Cart ID từ embed_data:', cartId);

        if (cartId) {
          // Log trước khi xóa
          const beforeDelete = await CartItem.find({ cart_id: cartId });
          console.log('CartItem trước khi xóa:', beforeDelete);

          // Xóa cart items
          const deleteResult = await CartItem.deleteMany({ cart_id: cartId });
          console.log('Kết quả xóa cart items:', deleteResult);

          // Log sau khi xóa
          const afterDelete = await CartItem.find({ cart_id: cartId });
          console.log('CartItem sau khi xóa:', afterDelete);
          
          console.log(`Đã xóa ${deleteResult.deletedCount} cart items cho cart_id: ${cartId}`);
        } else {
          console.log('Không tìm thấy cart_id trong embed_data');
        }
      } catch (cartError) {
        console.log('Lỗi khi xóa cart items:', cartError);
      }

      result.return_code = 1;
      result.return_message = 'success';
    }
  } catch (ex) {
    result.return_code = 0;
    result.return_message = ex.message;
    console.log('Lỗi callback ngoài:', ex);
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