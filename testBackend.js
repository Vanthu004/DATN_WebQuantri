const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const TEST_ADMIN = {
  email: 'thainqph36461@fpt.edu.vn',
  password: 'Test1234@',
};
const TEST_USER = {
  email: 'mixbro01@gmail.com',
  password: 'Test1234@',
};
const TEST_RECEIVER_ID = '688f1d65e627ed4c95147e5e';
const TEST_ADMIN_ID = '688f5625ee738af7ebb97067';
const TEST_IMAGE_PATH = 'C:/Users/quangthai/Desktop/DATN_WebQuantri/test.png';

async function testBackend() {
  console.log('=== BẮT ĐẦU KIỂM TRA BACKEND ===');

  // Bước 1: Đăng nhập (admin)
  console.log('Bước 1: Kiểm tra đăng nhập admin (/api/users/login)');
  let adminToken;
  try {
    const response = await axios.post(`${BASE_URL}/api/users/login`, TEST_ADMIN);
    console.log('✅ Đăng nhập admin thành công');
    console.log('JWT:', response.data.token);
    console.log('User:', response.data.user);
    adminToken = response.data.token;
  } catch (error) {
    console.error('❌ Lỗi đăng nhập admin:', error.response?.data || error.message);
    return;
  }

  // Bước 2: Đăng nhập (user)
  console.log('Bước 2: Kiểm tra đăng nhập user (/api/users/login)');
  let userToken;
  try {
    const response = await axios.post(`${BASE_URL}/api/users/login`, TEST_USER);
    console.log('✅ Đăng nhập user thành công');
    console.log('JWT:', response.data.token);
    console.log('User:', response.data.user);
    userToken = response.data.token;
  } catch (error) {
    console.error('❌ Lỗi đăng nhập user:', error.response?.data || error.message);
    return;
  }

  // Bước 3: Lấy Supabase token (admin)
  console.log('Bước 3: Kiểm tra lấy Supabase token admin (/supabase-token)');
  try {
    const response = await axios.get(`${BASE_URL}/supabase-token`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✅ Lấy Supabase token admin thành công');
    console.log('Supabase Token:', response.data.supabaseToken);
    console.log('User:', response.data.user);
  } catch (error) {
    console.error('❌ Lỗi lấy Supabase token admin:', error.response?.data || error.message);
    return;
  }

  // Bước 4: Lấy Supabase token (user)
  console.log('Bước 4: Kiểm tra lấy Supabase token user (/supabase-token)');
  try {
    const response = await axios.get(`${BASE_URL}/supabase-token`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log('✅ Lấy Supabase token user thành công');
    console.log('Supabase Token:', response.data.supabaseToken);
    console.log('User:', response.data.user);
  } catch (error) {
    console.error('❌ Lỗi lấy Supabase token user:', error.response?.data || error.message);
    return;
  }

  // Bước 5: Upload ảnh
  console.log('Bước 5: Kiểm tra upload ảnh (/api/users/upload-image)');
  let imageUrl;
  try {
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      console.error('❌ File ảnh không tồn tại:', TEST_IMAGE_PATH);
      return;
    }
    const form = new FormData();
    form.append('image', fs.createReadStream(TEST_IMAGE_PATH));
    const response = await axios.post(`${BASE_URL}/api/users/upload-image`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${userToken}`,
      },
    });
    console.log('✅ Upload ảnh thành công');
    console.log('Image URL:', response.data.image_url);
    imageUrl = response.data.image_url;
  } catch (error) {
    console.error('❌ Lỗi upload ảnh:', error.response?.data || error.message);
    return;
  }

  // Bước 6: Gửi tin nhắn (user → admin, với ảnh)
  console.log('Bước 6: Kiểm tra gửi tin nhắn user → admin với ảnh (/api/users/messages)');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/users/messages`,
      {
        receiver_id: TEST_ADMIN_ID,
        content: 'Hello Admin, this is a test from user with image!',
        image_url: imageUrl,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log('✅ Gửi tin nhắn user → admin thành công');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Lỗi gửi tin nhắn user → admin:', error.response?.data || error.message);
    return;
  }

  // Bước 7: Gửi tin nhắn (admin → user, không ảnh)
  console.log('Bước 7: Kiểm tra gửi tin nhắn admin → user (/api/users/messages)');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/users/messages`,
      {
        receiver_id: TEST_RECEIVER_ID,
        content: 'Hello User, this is a reply from admin!',
        image_url: null,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Gửi tin nhắn admin → user thành công');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Lỗi gửi tin nhắn admin → user:', error.response?.data || error.message);
    return;
  }

  // Bước 8: Kiểm tra lấy tin nhắn (user view)
  console.log('Bước 8: Kiểm tra lấy tin nhắn user view (/api/users/messages)');
  let userMessages;
  try {
    const response = await axios.get(
      `${BASE_URL}/api/users/messages?receiver_id=${TEST_ADMIN_ID}`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log('✅ Lấy tin nhắn user view thành công');
    console.log('Messages:', response.data.messages);
    userMessages = response.data.messages;
  } catch (error) {
    console.error('❌ Lỗi lấy tin nhắn user view:', error.response?.data || error.message);
    return;
  }

  // Bước 9: Kiểm tra lấy tin nhắn (admin view)
  console.log('Bước 9: Kiểm tra lấy tin nhắn admin view (/api/users/messages)');
  let adminMessages;
  try {
    const response = await axios.get(
      `${BASE_URL}/api/users/messages?receiver_id=${TEST_RECEIVER_ID}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Lấy tin nhắn admin view thành công');
    console.log('Messages:', response.data.messages);
    adminMessages = response.data.messages;
  } catch (error) {
    console.error('❌ Lỗi lấy tin nhắn admin view:', error.response?.data || error.message);
    return;
  }

  // Bước 10: So sánh tin nhắn từ cả hai phía
  console.log('Bước 10: Kiểm tra tính nhất quán của cuộc trò chuyện giữa user và admin');
  try {
    const userMessageIds = userMessages.map(msg => msg._id).sort();
    const adminMessageIds = adminMessages.map(msg => msg._id).sort();

    if (JSON.stringify(userMessageIds) === JSON.stringify(adminMessageIds)) {
      console.log('✅ Cả user và admin đều thấy cùng một lịch sử trò chuyện');
      console.log('Số lượng tin nhắn:', userMessages.length);
    } else {
      console.error('❌ Lịch sử trò chuyện không nhất quán giữa user và admin');
      console.log('User messages:', userMessageIds);
      console.log('Admin messages:', adminMessageIds);
    }
  } catch (error) {
    console.error('❌ Lỗi so sánh lịch sử trò chuyện:', error.message);
  }

  console.log('=== KẾT THÚC KIỂM TRA BACKEND ===');
}

testBackend();