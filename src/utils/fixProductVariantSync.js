const mongoose = require('mongoose');
require("dotenv").config();
const Product = require('../models/product');
const ProductVariant = require('../models/productVariant');
const { updateProductFromVariants, resetProductVariantInfo } = require('./productVariantSync');

// Kết nối database
async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ Lỗi: MONGODB_URI không được định nghĩa trong file .env');
      console.log('💡 Hãy tạo file .env với nội dung:');
      console.log('MONGODB_URI=mongodb://localhost:27017/swear_db');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối database thành công');
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    console.log('💡 Kiểm tra:');
    console.log('  1. File .env có tồn tại không?');
    console.log('  2. MONGODB_URI có đúng không?');
    console.log('  3. MongoDB có đang chạy không?');
    process.exit(1);
  }
}

/**
 * Kiểm tra và sửa chữa dữ liệu không đồng bộ giữa Product và ProductVariant
 */
async function fixProductVariantSync() {
  console.log('🔍 Bắt đầu kiểm tra và sửa chữa dữ liệu...');
  
  try {
    // Kết nối database trước
    await connectDB();
    
    // Lấy tất cả products
    const products = await Product.find({});
    console.log(`📦 Tìm thấy ${products.length} sản phẩm`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        // Kiểm tra variants của product
        const variants = await ProductVariant.find({ 
          product_id: product._id,
          is_active: true 
        });
        
        const hasVariants = variants.length > 0;
        const prices = variants.map(v => v.price).filter(p => p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        
        // Lấy danh sách size và color duy nhất
        const availableSizes = [...new Set(variants.map(v => v.attributes.size).filter(Boolean))];
        const availableColors = [...new Set(variants.map(v => v.attributes.color).filter(Boolean))];
        
        // Kiểm tra xem có cần cập nhật không
        const needsUpdate = 
          product.has_variants !== hasVariants ||
          product.min_price !== minPrice ||
          product.max_price !== maxPrice ||
          product.total_variants !== variants.length ||
          JSON.stringify(product.available_sizes.sort()) !== JSON.stringify(availableSizes.sort()) ||
          JSON.stringify(product.available_colors.sort()) !== JSON.stringify(availableColors.sort());
        
        if (needsUpdate) {
          console.log(`🔧 Sửa chữa sản phẩm: ${product.name} (${product.product_id})`);
          
          if (hasVariants) {
            await updateProductFromVariants(product._id);
          } else {
            await resetProductVariantInfo(product._id);
          }
          
          fixedCount++;
        }
      } catch (error) {
        console.error(`❌ Lỗi khi xử lý sản phẩm ${product.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`✅ Hoàn thành! Đã sửa chữa ${fixedCount} sản phẩm, ${errorCount} lỗi`);
    
  } catch (error) {
    console.error('❌ Lỗi khi chạy script:', error);
  } finally {
    // Đóng kết nối database
    await mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối database');
  }
}

/**
 * Kiểm tra tính nhất quán của dữ liệu
 */
async function checkDataConsistency() {
  console.log('🔍 Kiểm tra tính nhất quán dữ liệu...');
  
  try {
    // Kết nối database trước
    await connectDB();
    
    const products = await Product.find({});
    let inconsistencies = [];
    
    for (const product of products) {
      const variants = await ProductVariant.find({ 
        product_id: product._id,
        is_active: true 
      });
      
      const hasVariants = variants.length > 0;
      const prices = variants.map(v => v.price).filter(p => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      
      // Kiểm tra các trường
      if (product.has_variants !== hasVariants) {
        inconsistencies.push({
          product: product.name,
          field: 'has_variants',
          expected: hasVariants,
          actual: product.has_variants
        });
      }
      
      if (product.min_price !== minPrice) {
        inconsistencies.push({
          product: product.name,
          field: 'min_price',
          expected: minPrice,
          actual: product.min_price
        });
      }
      
      if (product.max_price !== maxPrice) {
        inconsistencies.push({
          product: product.name,
          field: 'max_price',
          expected: maxPrice,
          actual: product.max_price
        });
      }
      
      if (product.total_variants !== variants.length) {
        inconsistencies.push({
          product: product.name,
          field: 'total_variants',
          expected: variants.length,
          actual: product.total_variants
        });
      }
    }
    
    if (inconsistencies.length === 0) {
      console.log('✅ Dữ liệu nhất quán!');
    } else {
      console.log(`❌ Tìm thấy ${inconsistencies.length} vấn đề không nhất quán:`);
      inconsistencies.forEach(item => {
        console.log(`  - ${item.product}: ${item.field} (expected: ${item.expected}, actual: ${item.actual})`);
      });
    }
    
    return inconsistencies;
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra:', error);
    return [];
  } finally {
    // Đóng kết nối database
    await mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối database');
  }
}

/**
 * Tạo báo cáo thống kê
 */
async function generateReport() {
  console.log('📊 Tạo báo cáo thống kê...');
  
  try {
    // Kết nối database trước
    await connectDB();
    
    const totalProducts = await Product.countDocuments();
    const productsWithVariants = await Product.countDocuments({ has_variants: true });
    const productsWithoutVariants = await Product.countDocuments({ has_variants: false });
    const totalVariants = await ProductVariant.countDocuments({ is_active: true });
    const inactiveVariants = await ProductVariant.countDocuments({ is_active: false });
    
    console.log('📈 Thống kê:');
    console.log(`  - Tổng sản phẩm: ${totalProducts}`);
    console.log(`  - Sản phẩm có variants: ${productsWithVariants}`);
    console.log(`  - Sản phẩm không có variants: ${productsWithoutVariants}`);
    console.log(`  - Tổng variants active: ${totalVariants}`);
    console.log(`  - Variants inactive: ${inactiveVariants}`);
    
    return {
      totalProducts,
      productsWithVariants,
      productsWithoutVariants,
      totalVariants,
      inactiveVariants
    };
  } catch (error) {
    console.error('❌ Lỗi khi tạo báo cáo:', error);
  } finally {
    // Đóng kết nối database
    await mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối database');
  }
}

// Export functions
module.exports = {
  fixProductVariantSync,
  checkDataConsistency,
  generateReport
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'fix':
      fixProductVariantSync();
      break;
    case 'check':
      checkDataConsistency();
      break;
    case 'report':
      generateReport();
      break;
    default:
      console.log('Usage: node src/utils/fixProductVariantSync.js [fix|check|report]');
      console.log('  fix: Sửa chữa dữ liệu không đồng bộ');
      console.log('  check: Kiểm tra tính nhất quán');
      console.log('  report: Tạo báo cáo thống kê');
  }
} 