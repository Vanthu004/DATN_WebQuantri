// Test authController
console.log('🔧 Testing authController...');

try {
  const authController = require('./src/controllers/authController.js');
  console.log('✅ authController loaded successfully');
  console.log('📋 Available functions:', Object.keys(authController));
  
  // Kiểm tra xem có hàm sendPasswordResetEmail không
  if (typeof authController.sendPasswordResetEmail === 'function') {
    console.log('✅ sendPasswordResetEmail function exists');
  } else {
    console.log('❌ sendPasswordResetEmail function NOT found');
  }
  
  // Kiểm tra xem có hàm forgotPassword không
  if (typeof authController.forgotPassword === 'function') {
    console.log('✅ forgotPassword function exists');
  } else {
    console.log('❌ forgotPassword function NOT found');
  }
  
} catch (error) {
  console.error('❌ Error loading authController:', error.message);
  console.error('Stack trace:', error.stack);
} 