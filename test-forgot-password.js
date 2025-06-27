// Test forgot password function
require('dotenv').config();

console.log('🔧 Testing forgot password function...');

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
async function testForgotPassword() {
  try {
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
  }
}

// Run test
testForgotPassword(); 