// Test update profile route
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔧 Testing update profile route...');

// Mock request và response
const mockReq = {
  user: {
    userId: '685ca10c4096718cfbded0ec' // User ID từ token
  },
  body: {
    email: 'lythu2k4lc@gmail.com',
    gender: 'male',
    name: 'Văn thưok',
    phone_number: ''
  }
};

const mockRes = {
  status: function(code) {
    console.log(`📊 Response status: ${code}`);
    return this;
  },
  json: function(data) {
    console.log('📤 Response data:', JSON.stringify(data, null, 2));
    return this;
  }
};

// Test function
async function testUpdateProfile() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('📥 Loading userController...');
    const userController = require('./src/controllers/userController.js');
    
    console.log('✅ userController loaded');
    console.log('📋 Available functions:', Object.keys(userController));
    
    if (typeof userController.updateProfile === 'function') {
      console.log('✅ updateProfile function found');
      console.log('🚀 Testing updateProfile...');
      console.log('📝 Request data:', JSON.stringify(mockReq.body, null, 2));
      
      await userController.updateProfile(mockReq, mockRes);
      
    } else {
      console.log('❌ updateProfile function NOT found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Đóng kết nối MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run test
testUpdateProfile(); 