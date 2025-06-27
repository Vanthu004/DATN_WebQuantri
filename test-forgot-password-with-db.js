// Test forgot password function with MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔧 Testing forgot password function with MongoDB...');

// Mock request và response
const mockReq = {
  body: {
    email: 'lythu2k4lc@gmail.com'
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
async function testForgotPasswordWithDB() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('📥 Loading authController...');
    const authController = require('./src/controllers/authController.js');
    
    console.log('✅ authController loaded');
    console.log('📋 Available functions:', Object.keys(authController));
    
    if (typeof authController.forgotPassword === 'function') {
      console.log('✅ forgotPassword function found');
      console.log('🚀 Testing forgotPassword...');
      
      await authController.forgotPassword(mockReq, mockRes);
      
    } else {
      console.log('❌ forgotPassword function NOT found');
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
testForgotPasswordWithDB(); 