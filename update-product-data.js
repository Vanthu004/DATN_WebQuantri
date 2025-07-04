const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

const Product = require('./src/models/product');

async function updateProductData() {
  try {
    console.log('🔄 Đang cập nhật dữ liệu sản phẩm...\n');

    // Lấy tất cả sản phẩm
    const products = await Product.find({ is_deleted: false });
    console.log(`Tìm thấy ${products.length} sản phẩm`);

    if (products.length === 0) {
      console.log('❌ Không có sản phẩm nào để cập nhật');
      return;
    }

    // Cập nhật từng sản phẩm với dữ liệu khác nhau
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Tạo dữ liệu khác nhau cho mỗi sản phẩm
      const soldQuantity = Math.floor(Math.random() * 1000) + 1; // 1-1000
      const views = Math.floor(Math.random() * 5000) + 1; // 1-5000
      
      // Tạo createdAt khác nhau (sản phẩm mới nhất sẽ có createdAt mới nhất)
      const daysAgo = Math.floor(Math.random() * 30); // 0-30 ngày trước
      const createdAt = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
      
      await Product.findByIdAndUpdate(product._id, {
        sold_quantity: soldQuantity,
        views: views,
        createdAt: createdAt
      });

      console.log(`✅ Đã cập nhật: ${product.name} - Bán: ${soldQuantity}, Xem: ${views}, Tạo: ${createdAt.toLocaleDateString()}`);
    }

    console.log('\n🎉 Hoàn thành cập nhật dữ liệu!');
    
    // Hiển thị thống kê
    const updatedProducts = await Product.find({ is_deleted: false })
      .sort({ sold_quantity: -1 })
      .limit(5);
    
    console.log('\n📊 Top 5 sản phẩm bán chạy:');
    updatedProducts.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name} - Bán: ${p.sold_quantity}, Xem: ${p.views}`);
    });

    const newestProducts = await Product.find({ is_deleted: false })
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('\n📊 Top 5 sản phẩm mới nhất:');
    newestProducts.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name} - Tạo: ${p.createdAt.toLocaleDateString()}`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi cập nhật dữ liệu:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Chạy script
updateProductData(); 