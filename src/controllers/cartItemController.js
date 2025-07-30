const CartItem = require("../models/cartItem");
const Product = require("../models/product");
const ProductVariant = require("../models/productVariant");
const Cart = require("../models/cart");

/* Thêm sản phẩm vào giỏ hàng (hỗ trợ biến thể) */
exports.addItem = async (req, res) => {
  try {
    const { cart_id, product_id, product_variant_id, quantity = 1 } = req.body;

    // Validation
    if (!cart_id || !product_id) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu thông tin cart_id hoặc product_id" 
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ 
        success: false,
        msg: "Số lượng phải lớn hơn 0" 
      });
    }

    // Kiểm tra cart có tồn tại không
    const cart = await Cart.findById(cart_id);
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy giỏ hàng" 
      });
    }

    let variant = null;
    let product = null;
    let variantInfo = null;

    // Lấy thông tin sản phẩm và biến thể
    if (product_variant_id) {
      // Nếu có variant_id, lấy thông tin variant
      variant = await ProductVariant.findById(product_variant_id)
        .populate('attributes.size')
        .populate('attributes.color');
      
      if (!variant) {
        return res.status(404).json({ 
          success: false,
          msg: "Không tìm thấy biến thể sản phẩm" 
        });
      }

      // Kiểm tra variant có active không
      if (!variant.is_active) {
        return res.status(400).json({ 
          success: false,
          msg: "Biến thể sản phẩm không khả dụng" 
        });
      }

      // Kiểm tra stock
      if (variant.stock_quantity < quantity) {
        return res.status(400).json({ 
          success: false,
          msg: `Chỉ còn ${variant.stock_quantity} sản phẩm trong kho` 
        });
      }

      product = await Product.findById(variant.product_id);
      
      // Tạo variant info
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
      // Nếu không có variant_id, lấy thông tin sản phẩm chính
      product = await Product.findById(product_id);
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          msg: "Không tìm thấy sản phẩm" 
        });
      }

      // Kiểm tra sản phẩm có active không
      if (product.status !== 'active') {
        return res.status(400).json({ 
          success: false,
          msg: "Sản phẩm không khả dụng" 
        });
      }

      // Kiểm tra stock cho sản phẩm không có variant
      if (!product.has_variants && product.stock_quantity < quantity) {
        return res.status(400).json({ 
          success: false,
          msg: `Chỉ còn ${product.stock_quantity} sản phẩm trong kho` 
        });
      }
    }

    if (!product) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy sản phẩm" 
      });
    }

    // Kiểm tra xem cart-item đã tồn tại chưa
    const existingItem = await CartItem.findOne({ 
      cart_id, 
      product_id: product._id,
      product_variant_id: product_variant_id || null,
      is_active: true
    });

    if (existingItem) {
      // Nếu đã tồn tại, cập nhật số lượng
      const newQuantity = existingItem.quantity + quantity;
      
      // Kiểm tra stock với số lượng mới
      const maxStock = variant ? variant.stock_quantity : product.stock_quantity;
      if (newQuantity > maxStock) {
        return res.status(400).json({ 
          success: false,
          msg: `Chỉ có thể thêm tối đa ${maxStock - existingItem.quantity} sản phẩm nữa` 
        });
      }

      existingItem.quantity = newQuantity;
      existingItem.price_at_time = variant ? variant.price : product.price;
      existingItem.product_name = product.name;
      existingItem.product_image = variant ? variant.image_url : product.image_url;
      existingItem.variant_info = variantInfo;
      existingItem.updated_at = new Date();
      
      await existingItem.save();

      return res.json({
        success: true,
        msg: "Cập nhật số lượng thành công",
        data: existingItem
      });
    }

    // Nếu chưa tồn tại, tạo mới
    const newItem = await CartItem.create({
      cart_id,
      product_id: product._id,
      product_variant_id: product_variant_id || null,
      quantity,
      price_at_time: variant ? variant.price : product.price,
      product_name: product.name,
      product_image: variant ? variant.image_url : product.image_url,
      variant_info: variantInfo
    });

    res.status(201).json({
      success: true,
      msg: "Thêm vào giỏ hàng thành công",
      data: newItem
    });

  } catch (err) {
    console.error("Error adding item to cart:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi thêm vào giỏ hàng" 
    });
  }
};

/* Lấy tất cả item của 1 cart (populate biến thể) */
exports.getItemsByCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    
    if (!cartId) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu cart_id" 
      });
    }

    const items = await CartItem.find({ 
      cart_id: cartId,
      is_active: true 
    })
      .populate({
        path: 'product_variant_id',
        populate: [
          { path: 'attributes.size' },
          { path: 'attributes.color' }
        ]
      })
      .populate('product_id', 'name image_url status has_variants')
      .sort({ added_at: -1 });
    
    // Tính tổng tiền cho mỗi item và tổng giỏ hàng
    let cartTotal = 0;
    const itemsWithTotal = items.map(item => {
      const total = item.price_at_time * item.quantity;
      cartTotal += total;
      return {
        ...item.toObject(),
        total_price: total
      };
    });
    
    res.json({
      success: true,
      data: {
        items: itemsWithTotal,
        cart_total: cartTotal,
        item_count: items.length
      }
    });
  } catch (err) {
    console.error("Error getting cart items:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy danh sách giỏ hàng" 
    });
  }
};

/* Cập nhật số lượng */
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu item_id" 
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false,
        msg: "Số lượng phải lớn hơn 0" 
      });
    }

    const item = await CartItem.findById(id);
    if (!item) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy item trong giỏ hàng" 
      });
    }

    // Kiểm tra stock
    let maxStock;
    if (item.product_variant_id) {
      const variant = await ProductVariant.findById(item.product_variant_id);
      if (!variant || !variant.is_active) {
        return res.status(400).json({ 
          success: false,
          msg: "Biến thể sản phẩm không khả dụng" 
        });
      }
      maxStock = variant.stock_quantity;
    } else {
      const product = await Product.findById(item.product_id);
      if (!product || product.status !== 'active') {
        return res.status(400).json({ 
          success: false,
          msg: "Sản phẩm không khả dụng" 
        });
      }
      maxStock = product.stock_quantity;
    }

    if (quantity > maxStock) {
      return res.status(400).json({ 
        success: false,
        msg: `Chỉ còn ${maxStock} sản phẩm trong kho` 
      });
    }

    item.quantity = quantity;
    item.updated_at = new Date();
    await item.save();

    res.json({
      success: true,
      msg: "Cập nhật số lượng thành công",
      data: item
    });
  } catch (err) {
    console.error("Error updating quantity:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi cập nhật số lượng" 
    });
  }
};

/* Xoá item */
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu item_id" 
      });
    }

    const deleted = await CartItem.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy item trong giỏ hàng" 
      });
    }

    res.json({
      success: true,
      msg: "Đã xoá item khỏi giỏ hàng"
    });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi xóa item" 
    });
  }
};

/* Xóa tất cả items trong cart */
exports.clearCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu cart_id" 
      });
    }

    const result = await CartItem.updateMany(
      { cart_id: cartId, is_active: true },
      { is_active: false }
    );

    res.json({
      success: true,
      msg: "Đã xóa tất cả items trong giỏ hàng",
      deleted_count: result.modifiedCount
    });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi xóa giỏ hàng" 
    });
  }
};
