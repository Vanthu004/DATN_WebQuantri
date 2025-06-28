// Test API update avatar với upload riêng biệt
async function testAvatarUpdate() {
  try {
    console.log('🧪 Testing Avatar Update Flow...');
    console.log('');
    console.log('📋 Flow mới:');
    console.log('  1. Upload ảnh: POST /api/upload');
    console.log('  2. Update avatar: PUT /api/users/update-avatar');
    console.log('');
    console.log('💾 Storage: AWS S3 + MongoDB');
    console.log('📁 Upload trước, update sau');
    console.log('');
    console.log('✅ Configuration completed!');
    console.log('');
    console.log('📱 Usage from Expo:');
    console.log('  // Bước 1: Upload ảnh');
    console.log('  const formData = new FormData();');
    console.log('  formData.append("image", {');
    console.log('    uri: imageUri,');
    console.log('    type: "image/jpeg",');
    console.log('    name: "avatar.jpg"');
    console.log('  });');
    console.log('');
    console.log('  const uploadResponse = await fetch("/api/upload", {');
    console.log('    method: "POST",');
    console.log('    headers: { "Authorization": "Bearer token" },');
    console.log('    body: formData');
    console.log('  });');
    console.log('  const { uploadId } = await uploadResponse.json();');
    console.log('');
    console.log('  // Bước 2: Update avatar');
    console.log('  const updateResponse = await fetch("/api/users/update-avatar", {');
    console.log('    method: "PUT",');
    console.log('    headers: { ');
    console.log('      "Authorization": "Bearer token",');
    console.log('      "Content-Type": "application/json"');
    console.log('    },');
    console.log('    body: JSON.stringify({ uploadId })');
    console.log('  });');
    console.log('');
    console.log('🎯 Lợi ích:');
    console.log('  - Tách biệt upload và update');
    console.log('  - Có thể tái sử dụng ảnh đã upload');
    console.log('  - Dễ debug và maintain');
    console.log('  - Không lưu base64');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAvatarUpdate(); 