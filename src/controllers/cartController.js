const Cart = require("../models/cart");
const CartItem = require("../models/cartItem");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Product = require("../models/product");
const ProductVariant = require("../models/productVariant");
const mongoose = require("mongoose");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

/* Tạo giỏ hàng mới (user -> cart rỗng) */
exports.createCart = async (req, res) => {
  try {
    const { user_id, note } = req.body;

    if (!user_id) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu user_id" 
      });
    }

    // Kiểm tra xem user đã có cart active chưa
    const existingCart = await Cart.findOne({ 
      user_id, 
      status: "active" 
    });

    if (existingCart) {
      return res.status(400).json({ 
        success: false,
        msg: "User đã có giỏ hàng active",
        data: existingCart
      });
    }

    const cart = await Cart.create({ 
      user_id, 
      note,
      status: "active"
    });

    res.status(201).json({
      success: true,
      msg: "Tạo giỏ hàng thành công",
      data: cart
    });
  } catch (err) {
    console.error("Error creating cart:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi tạo giỏ hàng" 
    });
  }
};

/* Lấy tất cả giỏ hàng */
exports.getAllCarts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const carts = await Cart.find(query)
      .populate("user_id", "name email")
      .populate({
        path: 'items',
        model: 'CartItem',
        match: { is_active: true },
        populate: [
          { path: 'product_id', select: 'name image_url status' },
          { 
            path: 'product_variant_id',
            populate: [
              { path: 'attributes.size' },
              { path: 'attributes.color' }
            ]
          }
        ]
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Cart.countDocuments(query);

    res.json({
      success: true,
      data: {
        carts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error("Error getting all carts:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy danh sách giỏ hàng" 
    });
  }
};

/* Lấy giỏ hàng theo cart _id */
exports.getCartById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        msg: "cart_id không hợp lệ"
      });
    }

    const cart = await Cart.findById(id)
      .populate("user_id", "name email")
      .populate({
        path: 'items',
        model: 'CartItem',
        match: { is_active: true },
        populate: [
          { path: 'product_id', select: 'name image_url status has_variants' },
          { 
            path: 'product_variant_id',
            populate: [
              { path: 'attributes.size' },
              { path: 'attributes.color' }
            ]
          }
        ]
      });

    if (!cart) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy giỏ hàng" 
      });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (err) {
    console.error("Error getting cart by id:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy thông tin giỏ hàng" 
    });
  }
};

/* Lấy giỏ hàng của một người dùng */
exports.getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu user_id" 
      });
    }

    const cart = await Cart.findOne({ 
      user_id: userId,
      status: "active"
    }).populate("user_id", "name email");

    if (!cart) {
      return res.status(404).json({ 
        success: false,
        msg: "User chưa có giỏ hàng active" 
      });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (err) {
    console.error("Error getting cart by user:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy giỏ hàng của user" 
    });
  }
};

/* Cập nhật trạng thái giỏ hàng */
exports.updateCartStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        msg: "cart_id không hợp lệ"
      });
    }

    if (status && !["active", "converted", "abandoned"].includes(status)) {
      return res.status(400).json({ 
        success: false,
        msg: "Trạng thái không hợp lệ" 
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (note !== undefined) updateData.note = note;
    updateData.updated_at = new Date();

    const cart = await Cart.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("user_id", "name email");

    if (!cart) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy giỏ hàng" 
      });
    }

    res.json({
      success: true,
      msg: "Cập nhật giỏ hàng thành công",
      data: cart
    });
  } catch (err) {
    console.error("Error updating cart status:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi cập nhật giỏ hàng" 
    });
  }
};

/* Xoá giỏ hàng */
exports.deleteCart = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        msg: "cart_id không hợp lệ"
      });
    }

    const deleted = await Cart.findByIdAndUpdate(
      id,
      { status: "abandoned" },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy giỏ hàng" 
      });
    }

    res.json({
      success: true,
      msg: "Đã xoá giỏ hàng"
    });
  } catch (err) {
    console.error("Error deleting cart:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi xóa giỏ hàng" 
    });
  }
};

/* Tạo đơn hàng từ giỏ hàng */
exports.createOrderFromCart = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();
  
  try {
    const { shippingmethod_id, paymentmethod_id, shipping_address, note } = req.body;
    const cartId = req.params.id;

    if (!cartId || !isValidObjectId(cartId)) {
      return res.status(400).json({
        success: false,
        msg: "cart_id không hợp lệ"
      });
    }

    const cart = await Cart.findById(cartId).populate("user_id");
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy giỏ hàng" 
      });
    }

    if (cart.status !== "active") {
      return res.status(400).json({ 
        success: false,
        msg: "Giỏ hàng không ở trạng thái active" 
      });
    }

    // Lấy tất cả items trong cart
    const cartItems = await CartItem.find({ 
      cart_id: cartId,
      is_active: true 
    });
    
    if (cartItems.length === 0) {
      return res.status(400).json({ 
        success: false,
        msg: "Giỏ hàng trống" 
      });
    }

    // Kiểm tra stock và tính tổng tiền
    let total_price = 0;
    const orderDetails = [];

    for (const item of cartItems) {
      // Kiểm tra stock
      if (item.product_variant_id) {
        const variant = await ProductVariant.findById(item.product_variant_id);
        if (!variant || !variant.is_active) {
          return res.status(400).json({ 
            success: false,
            msg: `Biến thể sản phẩm ${item.product_name} không khả dụng` 
          });
        }
        if (variant.stock_quantity < item.quantity) {
          return res.status(400).json({ 
            success: false,
            msg: `Chỉ còn ${variant.stock_quantity} sản phẩm ${item.product_name} trong kho` 
          });
        }
      } else {
        const product = await Product.findById(item.product_id);
        if (!product || product.status !== 'active') {
          return res.status(400).json({ 
            success: false,
            msg: `Sản phẩm ${item.product_name} không khả dụng` 
          });
        }
        if (!product.has_variants && product.stock_quantity < item.quantity) {
          return res.status(400).json({ 
            success: false,
            msg: `Chỉ còn ${product.stock_quantity} sản phẩm ${item.product_name} trong kho` 
          });
        }
      }

      const detailData = {
        order_id: null, // Sẽ được set sau khi tạo order
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        price_each: item.price_at_time,
        product_name: item.product_name,
        product_price: item.price_at_time,
        product_image: item.product_image,
      };
      total_price += item.price_at_time * item.quantity;
      orderDetails.push(detailData);
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

    // Cập nhật trạng thái cart thành converted
    await Cart.findByIdAndUpdate(
      cartId,
      { 
        status: "converted",
        updated_at: new Date()
      },
      { session }
    );

    // Xóa cart items (set is_active = false)
    await CartItem.updateMany(
      { cart_id: cartId, is_active: true },
      { is_active: false },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      msg: "Tạo đơn hàng thành công",
      data: {
        order: order[0],
        order_code,
        total_price,
        item_count: cartItems.length
      }
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating order from cart:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi tạo đơn hàng" 
    });
  }
};
