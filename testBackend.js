const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'thainqph36461@fpt.edu.vn',
  password: 'Test1234@'
};

async function testBackend() {
  console.log('=== BẮT ĐẦU KIỂM TRA BACKEND ===');

  // Bước 1: Đăng nhập
  console.log('Bước 1: Kiểm tra đăng nhập (/api/users/login)');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, TEST_USER);
    console.log('✅ Đăng nhập thành công');
    console.log('JWT:', loginResponse.data.token);
    console.log('User:', loginResponse.data.user);

    // Bước 2: Lấy Supabase token
    console.log('Bước 2: Kiểm tra lấy Supabase token (/api/users/supabase-token)');
    const token = loginResponse.data.token;
    try {
      const supabaseResponse = await axios.get(`${BASE_URL}/api/users/supabase-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Lấy Supabase token thành công');
      console.log('Supabase Token:', supabaseResponse.data.supabaseToken);
      console.log('User:', supabaseResponse.data.user);
    } catch (error) {
      console.error('❌ Lỗi lấy Supabase token:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Response:', error.response?.data);
    }
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error.response?.data || error.message);
  }
}

testBackend();