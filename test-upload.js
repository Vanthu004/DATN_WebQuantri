const fs = require('fs');
const FormData = require('form-data');

// Test API upload avatar
async function testUploadAvatar() {
  try {
    // Tạo một file test ảnh nhỏ
    const testImagePath = './test-image.txt';
    fs.writeFileSync(testImagePath, 'Test image content');
    
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@example.com');
    formData.append('phone_number', '0123456789');
    formData.append('gender', 'male');
    formData.append('address', 'Test Address');
    formData.append('avata_url', fs.createReadStream(testImagePath), {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });

    console.log('✅ Test file created successfully');
    console.log('📁 Upload directory: uploads/avatars/');
    console.log('🌐 Server running on: http://localhost:3000');
    console.log('📡 API endpoint: PUT /api/users/update-profile');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testUploadAvatar(); 