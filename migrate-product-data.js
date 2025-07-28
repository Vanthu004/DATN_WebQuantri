require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./src/models/product");
const ProductVariant = require("./src/models/productVariant");

async function migrateProductData() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB Atlas");

    // Lấy tất cả sản phẩm
    const products = await Product.find({});
    console.log(`📦 Tìm thấy ${products.length} sản phẩm cần migrate`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Lấy variants của sản phẩm
        const variants = await ProductVariant.find({ product_id: product._id });
        
        // Tính toán các trường mới
        const hasVariants = variants.length > 0;
        let minPrice = product.price || 0;
        let maxPrice = product.price || 0;
        let availableSizes = [];
        let availableColors = [];

        if (hasVariants) {
          const prices = variants.map(v => v.price).filter(p => p > 0);
          if (prices.length > 0) {
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
          }
          
          // Lấy danh sách size và color duy nhất
          availableSizes = [...new Set(variants.map(v => v.attributes?.size).filter(Boolean))];
          availableColors = [...new Set(variants.map(v => v.attributes?.color).filter(Boolean))];
        }

        // Cập nhật sản phẩm
        await Product.findByIdAndUpdate(product._id, {
          has_variants: hasVariants,
          min_price: minPrice,
          max_price: maxPrice,
          total_variants: variants.length,
          available_sizes: availableSizes,
          available_colors: availableColors
        });

        // Cập nhật variants với trường mới
        if (variants.length > 0) {
          await ProductVariant.updateMany(
            { product_id: product._id },
            { 
              is_active: true,
              sort_order: 0
            }
          );
        }

        updatedCount++;
        console.log(`✅ Đã migrate sản phẩm: ${product.name} (${variants.length} variants)`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Lỗi khi migrate sản phẩm ${product.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration hoàn thành!`);
    console.log(`✅ Đã cập nhật: ${updatedCount} sản phẩm`);
    console.log(`❌ Lỗi: ${errorCount} sản phẩm`);

  } catch (error) {
    console.error("❌ Lỗi migration:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Đã ngắt kết nối MongoDB");
  }
}

// Chạy migration
migrateProductData(); 