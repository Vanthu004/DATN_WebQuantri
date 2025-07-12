const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/products';

async function testProductAPIs() {
  console.log('🧪 Testing Product APIs...\n');

  try {
    // Test Best Sellers
    console.log('🔥 Testing Best Sellers API...');
    const bestSellersResponse = await axios.get(`${BASE_URL}/best-sellers?limit=5`);
    console.log('Best Sellers:', bestSellersResponse.data.data.map(p => ({
      name: p.name,
      sold_quantity: p.sold_quantity,
      price: p.price
    })));
    console.log('');

    // Test Newest Products
    console.log('🆕 Testing Newest Products API...');
    const newestResponse = await axios.get(`${BASE_URL}/newest?limit=5`);
    console.log('Newest Products:', newestResponse.data.data.map(p => ({
      name: p.name,
      createdAt: p.createdAt,
      price: p.price
    })));
    console.log('');

    // Test Popular Products
    console.log('⭐ Testing Popular Products API...');
    const popularResponse = await axios.get(`${BASE_URL}/popular?limit=5`);
    console.log('Popular Products:', popularResponse.data.data.map(p => ({
      name: p.name,
      sold_quantity: p.sold_quantity,
      views: p.views,
      popularity_score: p.popularity_score,
      price: p.price
    })));
    console.log('');

    // Test Home Data
    console.log('🏠 Testing Home Data API...');
    const homeResponse = await axios.get(`${BASE_URL}/home?limit=3`);
    console.log('Home Data - Best Sellers:', homeResponse.data.data.bestSellers.products.map(p => p.name));
    console.log('Home Data - Newest:', homeResponse.data.data.newestProducts.products.map(p => p.name));
    console.log('Home Data - Popular:', homeResponse.data.data.popularProducts.products.map(p => p.name));
    console.log('');

    // Check if results are different
    const bestSellersIds = bestSellersResponse.data.data.map(p => p._id);
    const newestIds = newestResponse.data.data.map(p => p._id);
    const popularIds = popularResponse.data.data.map(p => p._id);

    console.log('📊 Analysis:');
    console.log('Best Sellers IDs:', bestSellersIds);
    console.log('Newest IDs:', newestIds);
    console.log('Popular IDs:', popularIds);

    // Check for duplicates
    const allIds = [...bestSellersIds, ...newestIds, ...popularIds];
    const uniqueIds = [...new Set(allIds)];
    
    console.log(`\nTotal unique products: ${uniqueIds.length}`);
    console.log(`Total products returned: ${allIds.length}`);
    
    if (uniqueIds.length === allIds.length) {
      console.log('✅ All APIs are returning different products!');
    } else {
      console.log('❌ Some APIs are returning duplicate products');
    }

  } catch (error) {
    console.error('❌ Error testing APIs:', error.response?.data || error.message);
  }
}

// Run the test
testProductAPIs(); 