const Product = require('../models/product');
const ProductVariant = require('../models/productVariant');

/**
 * Cập nhật thông tin product từ variants
 * @param {string} productId - ID của product
 * @returns {Promise<void>}
 */
async function updateProductFromVariants(productId) {
  try {
    const variants = await ProductVariant.find({ 
      product_id: productId,
      is_active: true 
    }).populate('attributes.size').populate('attributes.color');

    const hasVariants = variants.length > 0;
    const prices = variants.map(v => v.price).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    
    // Lấy danh sách size và color duy nhất
    const availableSizes = [...new Set(variants.map(v => v.attributes.size._id).filter(Boolean))];
    const availableColors = [...new Set(variants.map(v => v.attributes.color._id).filter(Boolean))];

    // Tính tổng stock từ variants
    const totalStockFromVariants = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);

    await Product.findByIdAndUpdate(productId, {
      has_variants: hasVariants,
      min_price: minPrice,
      max_price: maxPrice,
      total_variants: variants.length,
      available_sizes: availableSizes,
      available_colors: availableColors,
      // Cập nhật stock_quantity nếu có variants
      ...(hasVariants && { stock_quantity: totalStockFromVariants })
    });
  } catch (error) {
    console.error('Error updating product from variants:', error);
    throw error;
  }
}

/**
 * Cập nhật thông tin product khi không có variants
 * @param {string} productId - ID của product
 * @returns {Promise<void>}
 */
async function resetProductVariantInfo(productId) {
  try {
    await Product.findByIdAndUpdate(productId, {
      has_variants: false,
      min_price: 0,
      max_price: 0,
      total_variants: 0,
      available_sizes: [],
      available_colors: []
    });
  } catch (error) {
    console.error('Error resetting product variant info:', error);
    throw error;
  }
}

/**
 * Kiểm tra và cập nhật trạng thái product dựa trên stock
 * @param {string} productId - ID của product
 * @returns {Promise<void>}
 */
async function updateProductStatus(productId) {
  try {
    const product = await Product.findById(productId);
    if (!product) return;

    let newStatus = product.status;
    
    if (product.has_variants) {
      // Nếu có variants, kiểm tra stock của variants
      const variants = await ProductVariant.find({ 
        product_id: productId,
        is_active: true 
      });
      
      const totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
      
      if (totalStock === 0) {
        newStatus = 'out_of_stock';
      } else if (product.status === 'out_of_stock') {
        newStatus = 'active';
      }
    } else {
      // Nếu không có variants, kiểm tra stock của product
      if (product.stock_quantity === 0) {
        newStatus = 'out_of_stock';
      } else if (product.status === 'out_of_stock') {
        newStatus = 'active';
      }
    }

    if (newStatus !== product.status) {
      await Product.findByIdAndUpdate(productId, { status: newStatus });
    }
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
}

/**
 * Validate variant data
 * @param {Object} variantData - Dữ liệu variant
 * @returns {Object} - Kết quả validation
 */
function validateVariantData(variantData) {
  const errors = [];

  if (!variantData.product_id) {
    errors.push('Product ID is required');
  }

  if (!variantData.sku || variantData.sku.trim() === '') {
    errors.push('SKU is required');
  }

  if (!variantData.price || variantData.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (variantData.stock_quantity < 0) {
    errors.push('Stock quantity cannot be negative');
  }

  if (!variantData.attributes) {
    errors.push('Attributes are required');
  } else {
    if (!variantData.attributes.size) {
      errors.push('Size is required');
    }
    if (!variantData.attributes.color) {
      errors.push('Color is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  updateProductFromVariants,
  resetProductVariantInfo,
  updateProductStatus,
  validateVariantData
}; 