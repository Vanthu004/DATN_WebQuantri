// Test file để kiểm tra API notification
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test 1: Kiểm tra API users (không cần auth)
async function testUsersAPI() {
  try {
    console.log('🔍 Testing /users/all API...');
    const response = await axios.get(`${API_BASE_URL}/users/all`);
    console.log('✅ /users/all response:', {
      status: response.status,
      dataLength: response.data.length,
      firstUser: response.data[0] ? {
        _id: response.data[0]._id,
        name: response.data[0].name,
        email: response.data[0].email,
        role: response.data[0].role,
        token_device: response.data[0].token_device ? 'Has token' : 'No token',
        expo_push_token: response.data[0].expo_push_token ? 'Has expo token' : 'No expo token'
      } : 'No users found'
    });
    return response.data;
  } catch (error) {
    console.error('❌ /users/all error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return null;
  }
}

// Test 2: Kiểm tra API users với auth (cần token)
async function testUsersWithAuthAPI(token) {
  try {
    console.log('🔍 Testing /users API with auth...');
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ /users with auth response:', {
      status: response.status,
      dataLength: response.data.length,
      firstUser: response.data[0] ? {
        _id: response.data[0]._id,
        name: response.data[0].name,
        email: response.data[0].email,
        role: response.data[0].role,
        token_device: response.data[0].token_device ? 'Has token' : 'No token',
        expo_push_token: response.data[0].expo_push_token ? 'Has expo token' : 'No expo token'
      } : 'No users found'
    });
    return response.data;
  } catch (error) {
    console.error('❌ /users with auth error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return null;
  }
}

// Test 3: Kiểm tra API notification
async function testNotificationAPI(token, userId) {
  try {
    console.log('🔍 Testing notification API...');
    const response = await axios.post(`${API_BASE_URL}/notifications/send-notification`, {
      id: userId,
      title: 'Test Notification',
      body: 'This is a test notification',
      data: { type: 'test' }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Notification API response:', {
      status: response.status,
      message: response.data.message
    });
    return response.data;
  } catch (error) {
    console.error('❌ Notification API error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  // Test 1: Users API without auth
  const usersWithoutAuth = await testUsersAPI();
  
  // Test 2: Users API with auth (nếu có token)
  const token = process.env.TEST_TOKEN; // Có thể set token qua environment variable
  if (token) {
    const usersWithAuth = await testUsersWithAuthAPI(token);
    
    // Test 3: Notification API (nếu có user)
    if (usersWithAuth && usersWithAuth.length > 0) {
      await testNotificationAPI(token, usersWithAuth[0]._id);
    }
  } else {
    console.log('⚠️  No token provided, skipping auth tests');
    console.log('💡 To test with auth, set TEST_TOKEN environment variable');
  }
  
  console.log('\n🏁 Tests completed!');
}

// Chạy tests nếu file được execute trực tiếp
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testUsersAPI,
  testUsersWithAuthAPI,
  testNotificationAPI,
  runTests
};
