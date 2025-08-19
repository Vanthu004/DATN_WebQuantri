// Test file cho Product Suggestion API
// Chạy file này để test các API gợi ý sản phẩm

const BASE_URL = 'http://localhost:3000/api/products'; // Thay đổi port nếu cần

// Test function để gọi API
async function testAPI(endpoint, params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
    
    console.log(`\n🔍 Testing: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', data);
      return data;
    } else {
      console.log('❌ Error:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    return null;
  }
}

// Test tất cả các API
async function runAllTests() {
  console.log('🚀 Starting Product Suggestion API Tests...\n');
  
  // Test 1: Gợi ý sản phẩm (Autocomplete)
  console.log('📝 Test 1: Product Suggestions (Autocomplete)');
  await testAPI('/suggest', { keyword: 'áo', limit: 5 });
  
  // Test 2: Sản phẩm liên quan
  console.log('\n📝 Test 2: Related Products');
  // Cần thay đổi productId thành ID thực tế trong database
  await testAPI('/related', { productId: '64f1a2b3c4d5e6f7g8h9i0j1', limit: 4 });
  
  // Test 3: Sản phẩm trending
  console.log('\n📝 Test 3: Trending Products');
  await testAPI('/trending', { timeRange: 'week', limit: 6 });
  
  // Test 4: Gợi ý cá nhân hóa
  console.log('\n📝 Test 4: Personalized Suggestions');
  await testAPI('/personalized', { userId: '64f1a2b3c4d5e6f7g8h9i0j1', limit: 6 });
  
  // Test 5: Tìm kiếm nâng cao
  console.log('\n📝 Test 5: Enhanced Search');
  await testAPI('/search/enhanced', { 
    keyword: 'quần', 
    limit: 5, 
    sortBy: 'popularity' 
  });
  
  console.log('\n🎉 All tests completed!');
}

// Test riêng lẻ từng API
async function testSuggestions() {
  console.log('🔍 Testing Product Suggestions...');
  
  // Test với các từ khóa khác nhau
  const keywords = ['áo', 'quần', 'giày', 'túi'];
  
  for (const keyword of keywords) {
    console.log(`\n📝 Testing keyword: "${keyword}"`);
    await testAPI('/suggest', { keyword, limit: 3 });
  }
}

async function testTrendingProducts() {
  console.log('🔍 Testing Trending Products...');
  
  // Test với các khoảng thời gian khác nhau
  const timeRanges = ['today', 'week', 'month', 'all'];
  
  for (const timeRange of timeRanges) {
    console.log(`\n📝 Testing time range: "${timeRange}"`);
    await testAPI('/trending', { timeRange, limit: 4 });
  }
}

// Chạy test
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch'); // Cần cài đặt: npm install node-fetch
  
  // Chạy test chính
  runAllTests();
  
  // Hoặc chạy test riêng lẻ
  // testSuggestions();
  // testTrendingProducts();
} else {
  // Browser environment
  console.log('🌐 Running in browser...');
  
  // Thêm vào global scope để có thể gọi từ console
  window.testProductSuggestions = {
    runAllTests,
    testSuggestions,
    testTrendingProducts,
    testAPI
  };
  
  console.log('💡 Use window.testProductSuggestions.runAllTests() to run tests');
}

// Export cho module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testAPI,
    runAllTests,
    testSuggestions,
    testTrendingProducts
  };
}
