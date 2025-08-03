const mongoose = require('mongoose');
const Product = require('../models/product');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/datn_webquantri', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkAndFixInventoryData() {
  try {
    console.log('🔍 Kiểm tra dữ liệu kho hàng...');
    
    // Kiểm tra sản phẩm có stock_quantity null hoặc undefined
    const productsWithNullQuantity = await Product.find({
      $or: [
        { stock_quantity: null },
        { stock_quantity: { $exists: false } }
      ]
    });
    
    console.log(`📊 Sản phẩm có stock_quantity null/undefined: ${productsWithNullQuantity.length}`);
    
    if (productsWithNullQuantity.length > 0) {
      console.log('📝 Danh sách sản phẩm cần sửa:');
      productsWithNullQuantity.forEach(product => {
        console.log(`- ${product.name} (ID: ${product._id})`);
      });
      
      // Sửa stock_quantity thành 0 nếu null/undefined
      const updateResult = await Product.updateMany(
        {
          $or: [
            { stock_quantity: null },
            { stock_quantity: { $exists: false } }
          ]
        },
        { $set: { stock_quantity: 0 } }
      );
      
      console.log(`✅ Đã sửa ${updateResult.modifiedCount} sản phẩm`);
    }
    
    // Kiểm tra sản phẩm có price null hoặc undefined
    const productsWithNullPrice = await Product.find({
      $or: [
        { price: null },
        { price: { $exists: false } }
      ]
    });
    
    console.log(`💰 Sản phẩm có price null/undefined: ${productsWithNullPrice.length}`);
    
    if (productsWithNullPrice.length > 0) {
      console.log('📝 Danh sách sản phẩm cần sửa:');
      productsWithNullPrice.forEach(product => {
        console.log(`- ${product.name} (ID: ${product._id})`);
      });
      
      // Sửa price thành 0 nếu null/undefined
      const updateResult = await Product.updateMany(
        {
          $or: [
            { price: null },
            { price: { $exists: false } }
          ]
        },
        { $set: { price: 0 } }
      );
      
      console.log(`✅ Đã sửa ${updateResult.modifiedCount} sản phẩm`);
    }
    
    // Kiểm tra tổng quan
    const totalProducts = await Product.countDocuments();
    const productsWithValidData = await Product.countDocuments({
      stock_quantity: { $exists: true, $ne: null },
      price: { $exists: true, $ne: null }
    });
    
    console.log(`\n📈 Tổng quan:`);
    console.log(`- Tổng sản phẩm: ${totalProducts}`);
    console.log(`- Sản phẩm có dữ liệu hợp lệ: ${productsWithValidData}`);
    console.log(`- Sản phẩm cần sửa: ${totalProducts - productsWithValidData}`);
    
    // Test tính toán thống kê
    const testStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: { $ifNull: ["$stock_quantity", 0] } },
          totalValue: { $sum: { $multiply: [{ $ifNull: ["$stock_quantity", 0] }, { $ifNull: ["$price", 0] }] } }
        }
      }
    ]);
    
    if (testStats.length > 0) {
      const stats = testStats[0];
      console.log(`\n🧮 Test tính toán thống kê:`);
      console.log(`- Tổng sản phẩm: ${stats.totalProducts}`);
      console.log(`- Tổng số lượng: ${stats.totalQuantity}`);
      console.log(`- Tổng giá trị: ${stats.totalValue}`);
      
      if (isNaN(stats.totalValue)) {
        console.log(`❌ Phát hiện NaN trong totalValue!`);
      } else {
        console.log(`✅ Tính toán thống kê hoạt động bình thường`);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối database');
  }
}

// Chạy script
checkAndFixInventoryData(); 