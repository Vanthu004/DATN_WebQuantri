const ProductVariant = require('../models/productVariant');
const Product = require('../models/product');
const mongoose = require('mongoose');
const { 
  updateProductFromVariants, 
  resetProductVariantInfo, 
  updateProductStatus,
  validateVariantData 
} = require('../utils/productVariantSync');

// Tạo 1 hoặc nhiều biến thể
exports.createVariant = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body];

    // Validate từng variant
    const validationErrors = [];
    for (const item of data) {
      const validation = validateVariantData(item);
      if (!validation.isValid) {
        validationErrors.push({
          data: item,
          errors: validation.errors
        });
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationErrors 
      });
    }

    // Lọc các bản ghi hợp lệ
    const filtered = data.filter(item =>
      item.product_id && item.sku && item.price && item.attributes
    );

    if (filtered.length === 0) {
      return res.status(400).json({ error: "No valid variant provided" });
    }

    // Kiểm tra product có tồn tại không
    const productIds = [...new Set(filtered.map(item => item.product_id))];
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(400).json({ error: "Some products not found" });
    }

    // Kiểm tra SKU unique
    const skus = filtered.map(item => item.sku);
    const existingVariants = await ProductVariant.find({ sku: { $in: skus } });
    if (existingVariants.length > 0) {
      return res.status(400).json({ 
        error: "Some SKUs already exist", 
        existingSkus: existingVariants.map(v => v.sku) 
      });
    }

    const inserted = await ProductVariant.insertMany(filtered, { 
      session, 
      ordered: false 
    });

    // Cập nhật thông tin product cho từng product
    for (const productId of productIds) {
      await updateProductFromVariants(productId);
      await updateProductStatus(productId);
    }

    await session.commitTransaction();
    
    // Populate và trả về kết quả
    const populatedVariants = await ProductVariant.find({
      _id: { $in: inserted.map(v => v._id) }
    })
    .populate('attributes.size')
    .populate('attributes.color')
    .lean();

    res.status(201).json(populatedVariants);
  } catch (err) {
    await session.abortTransaction();
    console.error("Insert error:", err);
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

// Lấy tất cả biến thể của 1 sản phẩm
exports.getVariantsByProduct = async (req, res) => {
  try {
    const variants = await ProductVariant.find({ 
      product_id: req.params.productId,
      is_active: true 
    })
      .populate('attributes.size')
      .populate('attributes.color')
      .sort({ sort_order: 1 });
    res.json(variants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật biến thể
exports.updateVariant = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate dữ liệu cập nhật
    if (updateData.price !== undefined && updateData.price <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0" });
    }

    if (updateData.stock_quantity !== undefined && updateData.stock_quantity < 0) {
      return res.status(400).json({ error: "Stock quantity cannot be negative" });
    }

    // Kiểm tra variant có tồn tại không
    const existingVariant = await ProductVariant.findById(id);
    if (!existingVariant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    // Nếu thay đổi SKU, kiểm tra unique
    if (updateData.sku && updateData.sku !== existingVariant.sku) {
      const duplicateSku = await ProductVariant.findOne({ 
        sku: updateData.sku,
        _id: { $ne: id }
      });
      if (duplicateSku) {
        return res.status(400).json({ error: "SKU already exists" });
      }
    }

    const updated = await ProductVariant.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, session }
    )
    .populate('attributes.size')
    .populate('attributes.color');

    // Cập nhật thông tin product
    await updateProductFromVariants(existingVariant.product_id);
    await updateProductStatus(existingVariant.product_id);

    await session.commitTransaction();
    res.json(updated);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

// Xoá biến thể
exports.deleteVariant = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    
    const variant = await ProductVariant.findById(id);
    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    const productId = variant.product_id;
    
    await ProductVariant.findByIdAndDelete(id, { session });

    // Kiểm tra xem còn variant nào không
    const remainingVariants = await ProductVariant.find({ 
      product_id: productId,
      is_active: true 
    });

    if (remainingVariants.length === 0) {
      // Nếu không còn variant nào, reset thông tin product
      await resetProductVariantInfo(productId);
    } else {
      // Nếu còn variants, cập nhật thông tin product
      await updateProductFromVariants(productId);
    }

    await updateProductStatus(productId);

    await session.commitTransaction();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

// Cập nhật trạng thái variant (active/inactive)
exports.updateVariantStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const variant = await ProductVariant.findByIdAndUpdate(
      id,
      { is_active },
      { new: true, session }
    );

    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    // Cập nhật thông tin product
    await updateProductFromVariants(variant.product_id);
    await updateProductStatus(variant.product_id);

    await session.commitTransaction();
    res.json(variant);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
};
