// Test script cho API upload mới
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test 1: Đăng nhập để lấy token
async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    const response = await axios.post(`${BASE_URL}/users/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful, token received');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: Upload ảnh
async function testUpload() {
  try {
    console.log('📤 Testing upload...');
    
    const formData = new FormData();
    // Tạo một file ảnh test đơn giản (base64)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    formData.append('image', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    formData.append('relatedModel', 'User');
    formData.append('relatedId', 'test-user-id');

    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Upload successful:', response.data);
    return response.data.upload._id;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    return null;
  }
}

// Test 3: Lấy danh sách uploads
async function testGetUploads() {
  try {
    console.log('📋 Testing get uploads...');
    
    const response = await axios.get(`${BASE_URL}/uploads`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Get uploads successful:', response.data.length, 'uploads found');
    return true;
  } catch (error) {
    console.error('❌ Get uploads failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Cập nhật avatar cho user
async function testUpdateAvatar(uploadId) {
  try {
    console.log('👤 Testing update avatar...');
    
    const response = await axios.put(`${BASE_URL}/users/update-avatar`, {
      avatarId: uploadId
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Update avatar successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Update avatar failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 5: Cập nhật profile với avatar_url
async function testUpdateProfile() {
  try {
    console.log('📝 Testing update profile...');
    
    const response = await axios.put(`${BASE_URL}/users/update-profile`, {
      name: 'Test User Updated',
      email: 'test@example.com',
      phone_number: '0123456789',
      address: 'Test Address',
      avatar_url: 'https://example.com/test-avatar.jpg'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Update profile successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Update profile failed:', error.response?.data || error.message);
    return false;
  }
}

// Chạy tất cả tests
async function runAllTests() {
  console.log('🚀 Starting upload API tests...\n');
  
  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  console.log('');
  
  // Test 2: Upload
  const uploadId = await testUpload();
  
  console.log('');
  
  // Test 3: Get uploads
  await testGetUploads();
  
  console.log('');
  
  // Test 4: Update avatar (nếu upload thành công)
  if (uploadId) {
    await testUpdateAvatar(uploadId);
    console.log('');
  }
  
  // Test 5: Update profile
  await testUpdateProfile();
  
  console.log('\n🎉 All tests completed!');
}

// Chạy tests nếu file được execute trực tiếp
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testLogin,
  testUpload,
  testGetUploads,
  testUpdateAvatar,
  testUpdateProfile,
  runAllTests
}; 