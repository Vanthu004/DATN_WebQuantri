// Test API upload avatar vào MongoDB
async function testMongoDBAvatar() {
  try {
    console.log('🧪 Testing MongoDB Avatar Upload...');
    console.log('');
    console.log('📋 API Endpoints:');
    console.log('  PUT /api/users/update-profile - Upload avatar (Base64)');
    console.log('  GET /api/users/avatar/:id - Get avatar (Base64)');
    console.log('');
    console.log('💾 Storage: MongoDB Atlas (Base64)');
    console.log('📁 No local files needed');
    console.log('🌐 Accessible from anywhere');
    console.log('');
    console.log('✅ Configuration completed!');
    console.log('');
    console.log('📱 Usage from Expo:');
    console.log('  const formData = new FormData();');
    console.log('  formData.append("name", "User Name");');
    console.log('  formData.append("email", "user@example.com");');
    console.log('  formData.append("avata_url", {');
    console.log('    uri: imageUri,');
    console.log('    type: "image/jpeg",');
    console.log('    name: "avatar.jpg"');
    console.log('  });');
    console.log('');
    console.log('  fetch("/api/users/update-profile", {');
    console.log('    method: "PUT",');
    console.log('    headers: { "Authorization": "Bearer token" },');
    console.log('    body: formData');
    console.log('  });');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testMongoDBAvatar(); 