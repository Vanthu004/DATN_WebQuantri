# Hướng dẫn Debug tính năng gửi thông báo

## 🔍 Vấn đề hiện tại
Lỗi 401 Unauthorized khi gọi API `/users` trong trang SendNotification.

## 🛠️ Các bước debug

### 1. Kiểm tra Authentication
```bash
# Kiểm tra token trong localStorage
# Mở DevTools > Console và chạy:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### 2. Test API endpoints
```bash
# Chạy file test để kiểm tra API
node test_notification_api.js
```

### 3. Kiểm tra Network requests
1. Mở DevTools > Network tab
2. Refresh trang SendNotification
3. Tìm request đến `/users`
4. Kiểm tra:
   - Request headers có `Authorization: Bearer <token>` không
   - Response status code
   - Response body

## 🔧 Các sửa đổi đã thực hiện

### 1. Sửa file `api.tsx`
- ✅ Thêm authentication interceptor
- ✅ Tự động thêm token vào request headers
- ✅ Xử lý lỗi 401 và redirect về login

### 2. Sửa file `SendNotification.tsx`
- ✅ Kiểm tra token trước khi gọi API
- ✅ Sử dụng route `/users` với authentication
- ✅ Cải thiện error handling
- ✅ Thêm debug logs

### 3. Tạo file test
- ✅ `test_notification_api.js` để test API endpoints
- ✅ Test cả với và không có authentication

## 🚀 Cách test

### Test 1: Kiểm tra authentication
```javascript
// Trong browser console
const token = localStorage.getItem('token');
if (token) {
  console.log('✅ Token found:', token.substring(0, 20) + '...');
} else {
  console.log('❌ No token found');
}
```

### Test 2: Test API trực tiếp
```javascript
// Test API users (không cần auth)
fetch('http://localhost:3000/api/users/all')
  .then(res => res.json())
  .then(data => console.log('Users without auth:', data))
  .catch(err => console.error('Error:', err));

// Test API users (cần auth)
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Users with auth:', data))
  .catch(err => console.error('Error:', err));
```

### Test 3: Chạy file test
```bash
# Test không có token
node test_notification_api.js

# Test với token
TEST_TOKEN=your_token_here node test_notification_api.js
```

## 🔍 Debug checklist

### Trước khi test:
- [ ] Server đang chạy trên port 3000
- [ ] Đã đăng nhập vào admin panel
- [ ] Token có trong localStorage
- [ ] Token chưa hết hạn

### Khi test:
- [ ] Kiểm tra Network tab trong DevTools
- [ ] Kiểm tra Console tab cho errors
- [ ] Kiểm tra Application tab > Local Storage
- [ ] Test với file test_notification_api.js

### Sau khi test:
- [ ] Ghi lại lỗi cụ thể
- [ ] Kiểm tra server logs
- [ ] Kiểm tra database connection

## 🐛 Các lỗi thường gặp

### 1. Lỗi 401 Unauthorized
**Nguyên nhân:**
- Token không có trong request headers
- Token đã hết hạn
- Token không hợp lệ

**Cách sửa:**
- Kiểm tra localStorage có token không
- Đăng nhập lại để lấy token mới
- Kiểm tra JWT_SECRET trong server

### 2. Lỗi 500 Internal Server Error
**Nguyên nhân:**
- Database connection lỗi
- Server error

**Cách sửa:**
- Kiểm tra server logs
- Kiểm tra database connection
- Restart server

### 3. Lỗi CORS
**Nguyên nhân:**
- Frontend và backend khác domain/port

**Cách sửa:**
- Kiểm tra CORS configuration trong server
- Đảm bảo frontend gọi đúng URL

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề:

1. **Chụp screenshot** lỗi trong DevTools
2. **Copy logs** từ Console và Network tab
3. **Ghi lại steps** để reproduce lỗi
4. **Kiểm tra server logs** và copy error messages

### Thông tin cần cung cấp:
- Browser và version
- Error message cụ thể
- Steps để reproduce
- Screenshot lỗi
- Server logs (nếu có)

## 🔄 Rollback nếu cần

Nếu muốn rollback về version cũ:

```bash
# Revert file api.tsx
git checkout HEAD~1 -- admin/src/configs/api.tsx

# Revert file SendNotification.tsx  
git checkout HEAD~1 -- admin/src/pages/notify/SendNotification.tsx
```

## 📝 Notes

- File `test_notification_api.js` có thể xóa sau khi debug xong
- Đảm bảo server đang chạy trước khi test
- Kiểm tra environment variables (JWT_SECRET, etc.)
- Backup database trước khi test với dữ liệu thật
