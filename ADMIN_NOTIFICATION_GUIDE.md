# Hướng dẫn sử dụng tính năng gửi thông báo trong Admin Panel

## 📋 Tổng quan

Tính năng gửi thông báo cho phép admin gửi thông báo push đến người dùng thông qua 3 phương thức khác nhau:
- **Thông báo đơn lẻ**: Gửi cho 1 người dùng cụ thể
- **Thông báo hàng loạt**: Gửi cho nhiều người dùng được chọn
- **Thông báo theo nhóm**: Gửi cho nhóm người dùng theo bộ lọc

## 🚀 Cách truy cập

1. Đăng nhập vào Admin Panel
2. Vào menu **Thông báo** (Notify)
3. Nhấn nút **📤 Gửi thông báo**

## 📱 Các loại thông báo

### 1. Thông báo đơn lẻ 👤
- **Mục đích**: Gửi thông báo cho 1 người dùng cụ thể
- **Cách sử dụng**:
  - Chọn loại "Thông báo đơn lẻ"
  - Chọn đúng 1 người dùng từ danh sách
  - Nhập nội dung thông báo
  - Nhấn "Gửi thông báo"

### 2. Thông báo hàng loạt 👥
- **Mục đích**: Gửi thông báo cho nhiều người dùng được chọn
- **Cách sử dụng**:
  - Chọn loại "Thông báo hàng loạt"
  - Chọn nhiều người dùng từ danh sách (có thể dùng "Chọn tất cả")
  - Nhập nội dung thông báo
  - Nhấn "Gửi thông báo"

### 3. Thông báo theo nhóm 📢
- **Mục đích**: Gửi thông báo cho nhóm người dùng theo bộ lọc
- **Cách sử dụng**:
  - Chọn loại "Thông báo theo nhóm"
  - Thiết lập bộ lọc:
    - **Vai trò**: Chọn vai trò cụ thể (user, staff, admin) hoặc "Tất cả vai trò"
    - **Trạng thái token**: Chọn "Có token thông báo" hoặc "Tất cả người dùng"
  - Nhập nội dung thông báo
  - Nhấn "Gửi thông báo"

## 📝 Nội dung thông báo

### Tiêu đề thông báo *
- **Giới hạn**: Tối đa 100 ký tự
- **Ví dụ**: "Khuyến mãi mùa hè", "Đơn hàng đã được xử lý"

### Nội dung thông báo *
- **Giới hạn**: Tối đa 500 ký tự
- **Ví dụ**: "Giảm giá 50% cho tất cả sản phẩm mùa hè", "Đơn hàng #12345 đã được giao thành công"

### Dữ liệu tùy chỉnh (JSON)
- **Mục đích**: Gửi dữ liệu bổ sung kèm thông báo
- **Ví dụ**:
```json
{
  "type": "promotion",
  "action": "open_app",
  "promotion_id": "123",
  "discount": "50%"
}
```

## 👥 Quản lý người dùng

### Hiển thị thông tin người dùng
Mỗi người dùng hiển thị:
- **Tên**: Tên đầy đủ
- **Email**: Địa chỉ email
- **Vai trò**: user, staff, admin
- **Token**: Loại token thông báo (Expo Token, FCM Token, Không có token)

### Bộ lọc người dùng
- **Có token thông báo**: Chỉ hiển thị người dùng có token hợp lệ
- **Tất cả người dùng**: Hiển thị tất cả người dùng (kể cả không có token)

### Chọn người dùng
- **Checkbox**: Chọn/bỏ chọn từng người dùng
- **Chọn tất cả**: Chọn tất cả người dùng trong danh sách hiện tại
- **Bỏ chọn tất cả**: Bỏ chọn tất cả người dùng

## 🔍 Xem trước thông báo

Khi nhập tiêu đề hoặc nội dung, hệ thống sẽ hiển thị preview thông báo để admin có thể kiểm tra trước khi gửi.

## ✅ Validation và kiểm tra

### Validation tự động
- **Tiêu đề**: Bắt buộc, không được để trống
- **Nội dung**: Bắt buộc, không được để trống
- **Người dùng**: Phải chọn đúng số lượng người dùng theo loại thông báo
- **JSON**: Kiểm tra format JSON hợp lệ

### Thông báo lỗi
- **Lỗi validation**: Hiển thị thông báo lỗi màu đỏ
- **Lỗi server**: Hiển thị thông báo lỗi từ server
- **Thành công**: Hiển thị thông báo thành công màu xanh

## 📊 Kết quả gửi thông báo

### Thông báo đơn lẻ
- Thành công: "Gửi thông báo thành công!"
- Thất bại: Hiển thị lỗi cụ thể

### Thông báo hàng loạt/ nhóm
- Thành công: "Gửi thông báo thành công cho X người dùng!"
- Thất bại: Hiển thị số lượng thành công/thất bại

## 🛠️ Troubleshooting

### Lỗi thường gặp

1. **"Không thể tải danh sách người dùng"**
   - Kiểm tra kết nối mạng
   - Kiểm tra quyền truy cập API

2. **"Không có người dùng nào phù hợp"**
   - Kiểm tra bộ lọc có quá nghiêm ngặt không
   - Thử bỏ bớt điều kiện lọc

3. **"Token không hợp lệ"**
   - Người dùng chưa đăng ký nhận thông báo
   - Token đã hết hạn hoặc không hợp lệ

4. **"Có lỗi xảy ra khi gửi thông báo"**
   - Kiểm tra cấu hình Firebase/Expo
   - Kiểm tra logs server

### Debug tips

1. **Kiểm tra token người dùng**:
   - Xem thông tin token trong danh sách người dùng
   - Chỉ gửi cho người dùng có token hợp lệ

2. **Test với thông báo đơn lẻ**:
   - Bắt đầu với thông báo đơn lẻ để test
   - Sau đó mở rộng sang hàng loạt

3. **Kiểm tra logs**:
   - Xem logs server để debug lỗi
   - Kiểm tra response từ API

## 📋 Best Practices

### Nội dung thông báo
- **Tiêu đề ngắn gọn**: Tối đa 50 ký tự
- **Nội dung rõ ràng**: Mô tả chính xác thông tin
- **Call-to-action**: Hướng dẫn người dùng hành động

### Chọn người dùng
- **Target đúng đối tượng**: Chọn người dùng phù hợp
- **Tránh spam**: Không gửi quá nhiều thông báo
- **Test trước**: Test với nhóm nhỏ trước khi gửi hàng loạt

### Dữ liệu tùy chỉnh
- **Sử dụng có mục đích**: Chỉ gửi dữ liệu cần thiết
- **Format chuẩn**: Sử dụng JSON hợp lệ
- **Documentation**: Ghi chú mục đích sử dụng

## 🔒 Bảo mật

### Quyền truy cập
- Chỉ admin mới có quyền gửi thông báo
- Kiểm tra quyền trước khi thực hiện

### Dữ liệu cá nhân
- Không gửi thông tin nhạy cảm qua thông báo
- Tuân thủ quy định bảo vệ dữ liệu

### Rate limiting
- Giới hạn số lượng thông báo gửi
- Tránh spam và lạm dụng

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs server
2. Xem thông báo lỗi chi tiết
3. Liên hệ team phát triển với thông tin:
   - Loại lỗi
   - Thời gian xảy ra
   - Người dùng bị ảnh hưởng
   - Screenshot lỗi (nếu có)
