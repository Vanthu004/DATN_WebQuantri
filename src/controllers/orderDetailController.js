const OrderDetail = require("../models/OrderDetail");
const Product = require("../models/product");
const ProductVariant = require("../models/productVariant");
const Order = require("../models/Order");

/* Thêm chi tiết đơn hàng (hỗ trợ biến thể) */
exports.createOrderDetail = async (req, res) => {
  const session = await OrderDetail.startSession();
  session.startTransaction();
  
  try {
    const { order_id, product_id, product_variant_id, quantity, price_each } = req.body;

    // Validation
    if (!order_id || !product_id || !quantity || !price_each) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu thông tin bắt buộc" 
      });
    }

    if (quantity <= 0 || price_each <= 0) {
      return res.status(400).json({ 
        success: false,
        msg: "Số lượng và giá phải lớn hơn 0" 
      });
    }

    // Kiểm tra order có tồn tại không
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy đơn hàng" 
      });
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status === "Đã hủy" || order.status === "Hoàn thành") {
      return res.status(400).json({
        success: false,
        msg: "Không thể thêm sản phẩm vào đơn hàng đã hủy hoặc hoàn thành"
      });
    }

    let product = null;
    let variant = null;
    let variantInfo = null;

    if (product_variant_id) {
      variant = await ProductVariant.findById(product_variant_id)
        .populate('attributes.size')
        .populate('attributes.color');
      if (!variant) {
        return res.status(404).json({ 
          success: false,
          msg: "Không tìm thấy biến thể sản phẩm" 
        });
      }
      
      // Kiểm tra stock của variant
      if (variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          msg: `Chỉ còn ${variant.stock} sản phẩm trong kho`
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
      product = await Product.findById(product_id);
      
      // Kiểm tra stock của product
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          msg: `Chỉ còn ${product.stock} sản phẩm trong kho`
        });
      }
    }
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy sản phẩm" 
      });
    }

    // Gán thông tin sản phẩm vào order detail
    const detailData = {
      order_id,
      product_id: product._id,
      product_variant_id: product_variant_id || null,
      quantity,
      price_each: variant ? variant.price : product.price,
      product_name: product.name,
      product_price: product.price,
      product_image: variant ? variant.image_url : product.image_url,
      variant_info: variantInfo
    };

    const detail = await OrderDetail.create([detailData], { session });
    
    // Cập nhật stock
    if (variant) {
      await ProductVariant.findByIdAndUpdate(
        product_variant_id,
        { $inc: { stock: -quantity } },
        { session }
      );
    } else {
      await Product.findByIdAndUpdate(
        product_id,
        { $inc: { stock: -quantity, sold_quantity: quantity } },
        { session }
      );
    }
    
    // Sau khi tạo, cập nhật lại tổng tiền cho Order
    await updateOrderTotalPrice(detail[0].order_id, session);
    
    await session.commitTransaction();
    session.endSession();
    
    // Populate khi trả về
    const populated = await OrderDetail.findById(detail[0]._id)
      .populate({
        path: 'product_variant_id',
        populate: [
          { path: 'attributes.size' },
          { path: 'attributes.color' }
        ]
      })
      .populate('product_id', 'name image_url status');

    res.status(201).json({
      success: true,
      msg: "Thêm chi tiết đơn hàng thành công",
      data: populated
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating order detail:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi thêm chi tiết đơn hàng" 
    });
  }
};

/* Lấy tất cả chi tiết đơn hàng */
exports.getAllOrderDetails = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const details = await OrderDetail.find(query)
      .populate("order_id", "order_code status total_price")
      .populate("product_id", "name image_url status")
      .populate({
        path: 'product_variant_id',
        populate: [
          { path: 'attributes.size' },
          { path: 'attributes.color' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OrderDetail.countDocuments(query);

    res.json({
      success: true,
      data: {
        details,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error("Error getting all order details:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy danh sách chi tiết đơn hàng" 
    });
  }
};

/* Lấy chi tiết theo ID */
exports.getOrderDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu detail_id" 
      });
    }

    const detail = await OrderDetail.findById(id)
      .populate("order_id", "order_code status total_price")
      .populate("product_id", "name image_url status description")
      .populate({
        path: 'product_variant_id',
        populate: [
          { path: 'attributes.size' },
          { path: 'attributes.color' }
        ]
      });

    if (!detail) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy chi tiết đơn hàng" 
      });
    }

    res.json({
      success: true,
      data: detail
    });
  } catch (err) {
    console.error("Error getting order detail by id:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy thông tin chi tiết đơn hàng" 
    });
  }
};

/* Lấy tất cả chi tiết theo order_id */
exports.getByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.query;

    if (!orderId) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu order_id" 
      });
    }

    let query = { order_id: orderId };
    if (status) query.status = status;

    const details = await OrderDetail.find(query)
      .populate("product_id", "name image_url status description")
      .populate({
        path: 'product_variant_id',
        populate: [
          { path: 'attributes.size' },
          { path: 'attributes.color' }
        ]
      })
      .sort({ createdAt: -1 });

    // Tính tổng tiền
    let totalAmount = 0;
    const detailsWithTotal = details.map(detail => {
      const total = detail.price_each * detail.quantity;
      totalAmount += total;
      return {
        ...detail.toObject(),
        total_price: total
      };
    });

    res.json({
      success: true,
      data: {
        details: detailsWithTotal,
        total_amount: totalAmount,
        item_count: details.length
      }
    });
  } catch (err) {
    console.error("Error getting order details by order id:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy chi tiết đơn hàng" 
    });
  }
};

/* Cập nhật chi tiết đơn hàng */
exports.updateOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (!id) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu detail_id" 
      });
    }

    const detail = await OrderDetail.findById(id);
    if (!detail) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy chi tiết đơn hàng" 
      });
    }

    // Validation cho quantity và price_each
    if (updateData.quantity !== undefined && updateData.quantity <= 0) {
      return res.status(400).json({ 
        success: false,
        msg: "Số lượng phải lớn hơn 0" 
      });
    }

    if (updateData.price_each !== undefined && updateData.price_each <= 0) {
      return res.status(400).json({ 
        success: false,
        msg: "Giá phải lớn hơn 0" 
      });
    }

    const updated = await OrderDetail.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("product_id", "name image_url")
      .populate({
        path: 'product_variant_id',
        populate: [
          { path: 'attributes.size' },
          { path: 'attributes.color' }
        ]
      });

    // Cập nhật tổng tiền cho Order
    await updateOrderTotalPrice(updated.order_id);

    res.json({
      success: true,
      msg: "Cập nhật chi tiết đơn hàng thành công",
      data: updated
    });
  } catch (err) {
    console.error("Error updating order detail:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi cập nhật chi tiết đơn hàng" 
    });
  }
};

/* Xoá chi tiết (soft delete) */
exports.deleteOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu detail_id" 
      });
    }

    const detail = await OrderDetail.findById(id);
    if (!detail) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy chi tiết đơn hàng" 
      });
    }

    // Soft delete - cập nhật trạng thái thành "cancelled"
    const deleted = await OrderDetail.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    // Sau khi xóa, cập nhật lại tổng tiền cho Order
    await updateOrderTotalPrice(deleted.order_id);

    res.json({
      success: true,
      msg: "Đã xoá chi tiết đơn hàng"
    });
  } catch (err) {
    console.error("Error deleting order detail:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi xóa chi tiết đơn hàng" 
    });
  }
};

/* Xem chi tiết order detail (kèm thông tin order và variant) */
exports.getOrderDetailFullById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        msg: "Thiếu detail_id" 
      });
    }

    const detail = await OrderDetail.findById(id)
      .populate("order_id")
      .populate("product_id", "name image_url status description category_id")
      .populate({
        path: 'product_variant_id',
        populate: [
          { path: 'attributes.size' },
          { path: 'attributes.color' }
        ]
      });

    if (!detail) {
      return res.status(404).json({ 
        success: false,
        msg: "Không tìm thấy chi tiết đơn hàng" 
      });
    }

    res.json({
      success: true,
      data: detail
    });
  } catch (err) {
    console.error("Error getting order detail full by id:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy thông tin chi tiết đơn hàng" 
    });
  }
};

// Hàm cập nhật tổng tiền cho Order
async function updateOrderTotalPrice(orderId, session = null) {
  try {
    const details = await OrderDetail.find({ 
      order_id: orderId,
      status: "active"
    });
    const total = details.reduce((sum, d) => sum + (d.price_each * d.quantity), 0);
    
    const updateOptions = session ? { session } : {};
    await Order.findByIdAndUpdate(orderId, { total_price: total }, updateOptions);
  } catch (error) {
    console.error("Error updating order total price:", error);
  }
}
