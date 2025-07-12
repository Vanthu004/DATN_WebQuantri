const Cart = require("../models/cart");


/* Tạo giỏ hàng mới (user -> cart rỗng) */
exports.createCart = async (req, res) => {
  try {
    const cart = await Cart.create({ user_id: req.body.user_id });
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả giỏ hàng */
exports.getAllCarts = async (_req, res) => {
  try {
    const list = await Cart.find().populate("user_id", "name email");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy giỏ hàng theo cart _id */
exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate(
      "user_id",
      "name email"
    );
    if (!cart) return res.status(404).json({ msg: "Không tìm thấy cart" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy giỏ hàng của một người dùng */
exports.getCartByUser = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.params.userId });
    if (!cart) return res.status(404).json({ msg: "User chưa có cart" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Xoá giỏ hàng */
exports.deleteCart = async (req, res) => {
  try {
    const deleted = await Cart.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy cart" });
    res.json({ msg: "Đã xoá cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* Tạo đơn hàng từ giỏ hàng */
exports.createOrderFromCart = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();
  
  try {
    const { shippingmethod_id, paymentmethod_id, shipping_address, note } = req.body;
    const cartId = req.params.id;
    const cart = await Cart.findById(cartId).populate("user_id");
    if (!cart) {
      return res.status(404).json({ msg: "Không tìm thấy giỏ hàng" });
    }

    // Lấy tất cả items trong cart
    const cartItems = await CartItem.find({ cart_id: cartId });
    if (cartItems.length === 0) {
      return res.status(400).json({ msg: "Giỏ hàng trống" });
    }

    // Tạo order_code tự động
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

    // Tính tổng tiền và tạo order details
    let total_price = 0;
    const orderDetails = [];

    for (const item of cartItems) {
      const detailData = {
        order_id: null, // Sẽ được set sau khi tạo order
        product_id: item.product_id,
        quantity: item.quantity,
        price_each: item.price_at_time,
        product_name: item.product_name,
        product_price: item.price_at_time,
        product_image: item.product_image,
      };
      total_price += item.price_at_time * item.quantity;
      orderDetails.push(detailData);
    }

    // Tạo Order
    const order = await Order.create([{
      user_id: cart.user_id._id,
      total_price,
      shippingmethod_id,
      paymentmethod_id,
      shipping_address,
      order_code,
      note
    }], { session });

    const orderId = order[0]._id;

    // Tạo OrderDetails
    for (const detail of orderDetails) {
      detail.order_id = orderId;
      await OrderDetail.create([detail], { session });
    }

    // Xóa cart items sau khi tạo order thành công
    await CartItem.deleteMany({ cart_id: cartId }, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      msg: "Tạo đơn hàng thành công",
      order: order[0],
      order_code
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
};

