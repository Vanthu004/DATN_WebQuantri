const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Thay đổi URL theo server của bạn

// Test các API mới
async function testHomeAPIs() {
  console.log('🧪 Bắt đầu test các API mới...\n');

  try {
    // Test 1: API Bán chạy nhất
    console.log('🔥 Test API Bán chạy nhất...');
    const bestSellersResponse = await axios.get(`${BASE_URL}/api/products/best-sellers?limit=5`);
    console.log('✅ Best Sellers API:', bestSellersResponse.data.success ? 'Thành công' : 'Thất bại');
    console.log('📊 Số sản phẩm:', bestSellersResponse.data.data.length);
    console.log('');

    // Test 2: API Mới nhất
    console.log('🆕 Test API Mới nhất...');
    const newestResponse = await axios.get(`${BASE_URL}/api/products/newest?limit=5`);
    console.log('✅ Newest Products API:', newestResponse.data.success ? 'Thành công' : 'Thất bại');
    console.log('📊 Số sản phẩm:', newestResponse.data.data.length);
    console.log('');

    // Test 3: API Phổ biến nhất
    console.log('⭐ Test API Phổ biến nhất...');
    const popularResponse = await axios.get(`${BASE_URL}/api/products/popular?limit=5`);
    console.log('✅ Popular Products API:', popularResponse.data.success ? 'Thành công' : 'Thất bại');
    console.log('📊 Số sản phẩm:', popularResponse.data.data.length);
    console.log('');

    // Test 4: API Tổng hợp Home
    console.log('🏠 Test API Tổng hợp Home...');
    const homeResponse = await axios.get(`${BASE_URL}/api/home?limit=5`);
    console.log('✅ Home Data API:', homeResponse.data.success ? 'Thành công' : 'Thất bại');
    console.log('📊 Best Sellers:', homeResponse.data.data.bestSellers.products.length);
    console.log('📊 Newest Products:', homeResponse.data.data.newestProducts.products.length);
    console.log('📊 Popular Products:', homeResponse.data.data.popularProducts.products.length);
    console.log('');

    // Test 5: API Tăng lượt xem (nếu có sản phẩm)
    if (bestSellersResponse.data.data.length > 0) {
      const firstProductId = bestSellersResponse.data.data[0]._id;
      console.log('📈 Test API Tăng lượt xem...');
      const viewsResponse = await axios.post(`${BASE_URL}/api/products/${firstProductId}/increment-views`);
      console.log('✅ Increment Views API:', viewsResponse.data.success ? 'Thành công' : 'Thất bại');
      console.log('👁️ Lượt xem mới:', viewsResponse.data.data.views);
      console.log('');
    }

    console.log('🎉 Tất cả test hoàn thành!');

  } catch (error) {
    console.error('❌ Lỗi khi test:', error.response?.data || error.message);
  }
}

// Test với dữ liệu mẫu
async function createSampleData() {
  console.log('📝 Tạo dữ liệu mẫu để test...\n');

  try {
    // Tạo một số sản phẩm mẫu với dữ liệu khác nhau
    const sampleProducts = [
      {
        product_id: 'PROD001',
        name: 'iPhone 15 Pro Max',
        description: 'Điện thoại cao cấp mới nhất',
        price: 35000000,
        stock_quantity: 50,
        category_id: '507f1f77bcf86cd799439011', // Thay đổi ID category thực tế
        image_url: 'https://example.com/iphone15.jpg',
        sold_quantity: 150,
        views: 500
      },
      {
        product_id: 'PROD002',
        name: 'Samsung Galaxy S24',
        description: 'Điện thoại Android hàng đầu',
        price: 28000000,
        stock_quantity: 30,
        category_id: '507f1f77bcf86cd799439011',
        image_url: 'https://example.com/samsung-s24.jpg',
        sold_quantity: 120,
        views: 400
      },
      {
        product_id: 'PROD003',
        name: 'MacBook Pro M3',
        description: 'Laptop mạnh mẽ cho công việc',
        price: 45000000,
        stock_quantity: 20,
        category_id: '507f1f77bcf86cd799439012', // Thay đổi ID category thực tế
        image_url: 'https://example.com/macbook-pro.jpg',
        sold_quantity: 80,
        views: 300
      }
    ];

    for (const product of sampleProducts) {
      try {
        await axios.post(`${BASE_URL}/api/products`, product);
        console.log(`✅ Đã tạo sản phẩm: ${product.name}`);
      } catch (error) {
        console.log(`⚠️ Sản phẩm ${product.name} có thể đã tồn tại hoặc lỗi:`, error.response?.data?.error || error.message);
      }
    }

    console.log('\n📊 Dữ liệu mẫu đã được tạo!\n');

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error.response?.data || error.message);
  }
}

// Chạy test
async function runTests() {
  console.log('🚀 Bắt đầu test hệ thống...\n');
  
  // Tạo dữ liệu mẫu trước
  await createSampleData();
  
  // Test các API
  await testHomeAPIs();
}

// Chạy nếu file được gọi trực tiếp
if (require.main === module) {
  runTests();
}

module.exports = {
  testHomeAPIs,
  createSampleData,
  runTests
}; 