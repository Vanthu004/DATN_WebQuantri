// Test file để kiểm tra API Search History
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/search-history';

async function testAPI() {
  try {
    console.log('🔍 Testing Search History API...\n');
    
    // Test 1: Popular keywords
    console.log('📝 Test 1: Popular Keywords');
    const response1 = await fetch(`${BASE_URL}/popular?limit=5`);
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));
    console.log('---\n');
    
    // Test 2: Real-time popular keywords
    console.log('📝 Test 2: Real-time Popular Keywords');
    const response2 = await fetch(`${BASE_URL}/realtime-popular?limit=5&hours=24`);
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(data2, null, 2));
    console.log('---\n');
    
    // Test 3: Search stats
    console.log('📝 Test 3: Search Statistics');
    const response3 = await fetch(`${BASE_URL}/stats`);
    const data3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', JSON.stringify(data3, null, 2));
    console.log('---\n');
    
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Chạy test
testAPI();
