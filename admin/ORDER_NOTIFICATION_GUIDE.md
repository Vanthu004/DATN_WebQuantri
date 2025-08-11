# Hệ thống Thông báo Đơn hàng Mới

## Tổng quan

Hệ thống thông báo đơn hàng mới được thiết kế để tự động phát hiện và hiển thị thông báo khi có đơn hàng mới được tạo. Hệ thống bao gồm:

1. **Toast Notification**: Thông báo nổi lên ở góc phải màn hình
2. **Badge Counter**: Hiển thị số đơn hàng chờ xử lý trên menu
3. **Auto-refresh**: Tự động kiểm tra đơn hàng mới mỗi 5 giây

## Các thành phần chính

### 1. OrderNotifyContext (`src/contexts/OrderNotifyContext.tsx`)
- Quản lý state toàn cục cho thông báo đơn hàng
- Cung cấp các function để cập nhật trạng thái

### 2. OrderToast Component (`src/components/OrderToast.tsx`)
- Component hiển thị toast notification
- Có animation đẹp mắt và responsive
- Tự động ẩn sau 8 giây

### 3. useOrderNotification Hook (`src/hooks/useOrderNotification.ts`)
- Hook quản lý logic kiểm tra đơn hàng mới
- Tự động gọi API mỗi 5 giây
- Xử lý việc phát hiện đơn hàng mới

### 4. CSS Styling (`src/css/notify/orderToast.css`)
- Styling cho toast notification
- Animation và responsive design

## Cách hoạt động

### 1. Khởi tạo
- Khi ứng dụng khởi động, `OrderNotifyProvider` wrap toàn bộ app
- `useOrderNotification` hook được gọi trong `LayoutAdmin`
- Hệ thống bắt đầu kiểm tra đơn hàng mới

### 2. Kiểm tra đơn hàng mới
- Mỗi 5 giây, hệ thống gọi API `/api/orders`
- So sánh ID đơn hàng mới nhất với ID đã lưu
- Nếu có đơn hàng mới, hiển thị toast notification

### 3. Hiển thị thông báo
- Toast notification xuất hiện ở góc phải màn hình
- Hiển thị thông tin: mã đơn, khách hàng, tổng tiền, thời gian
- Có 2 nút: "Xem đơn hàng" và "Xem tất cả"
- Tự động ẩn sau 8 giây

### 4. Badge Counter
- Hiển thị số đơn hàng chờ xử lý trên menu "Thông báo"
- Cập nhật tự động khi có đơn hàng mới

## Tính năng

### Toast Notification
- ✅ Animation slide-in từ phải
- ✅ Hiển thị thông tin chi tiết đơn hàng
- ✅ Nút đóng thủ công
- ✅ Tự động ẩn sau 8 giây
- ✅ Progress bar hiển thị thời gian còn lại
- ✅ Responsive design

### Navigation
- ✅ Click "Xem đơn hàng" → Chuyển đến trang chi tiết đơn hàng
- ✅ Click "Xem tất cả" → Chuyển đến trang thông báo
- ✅ Badge counter trên menu

### Auto-refresh
- ✅ Kiểm tra mỗi 5 giây
- ✅ Chỉ hiển thị thông báo khi có đơn hàng thực sự mới
- ✅ Tránh spam notification

## Cách sử dụng

### 1. Để test hệ thống:
1. Mở ứng dụng admin
2. Tạo một đơn hàng mới từ frontend hoặc database
3. Toast notification sẽ xuất hiện sau tối đa 5 giây

### 2. Để tùy chỉnh:
- Thay đổi thời gian kiểm tra: Sửa `5000` trong `useOrderNotification.ts`
- Thay đổi thời gian hiển thị toast: Sửa `8000` trong `OrderToast.tsx`
- Tùy chỉnh styling: Sửa `orderToast.css`

### 3. Để debug:
- Mở Developer Tools → Console
- Xem log "New order detected: [order_code]"
- Kiểm tra Network tab để xem API calls

## Cấu trúc file

```
src/
├── components/
│   ├── OrderToast.tsx          # Component toast notification
│   └── layouts/
│       └── LayoutAdmin.tsx     # Layout chính với toast
├── contexts/
│   └── OrderNotifyContext.tsx  # Context quản lý state
├── hooks/
│   └── useOrderNotification.ts # Hook logic kiểm tra
├── css/
│   └── notify/
│       └── orderToast.css      # Styling cho toast
└── pages/
    └── notify/
        └── Notify.tsx          # Trang thông báo
```

## Lưu ý

1. **Performance**: Hệ thống chỉ gọi API mỗi 5 giây, không ảnh hưởng performance
2. **Memory**: Sử dụng `useCallback` và `useRef` để tránh memory leak
3. **Error Handling**: Có xử lý lỗi khi API call thất bại
4. **Responsive**: Toast notification responsive trên mobile
5. **Accessibility**: Có aria-label và keyboard navigation

## Troubleshooting

### Toast không hiển thị:
- Kiểm tra console có lỗi không
- Kiểm tra API `/api/orders` có hoạt động không
- Kiểm tra `lastCheckedOrderId` có được set đúng không

### Toast hiển thị liên tục:
- Kiểm tra logic so sánh ID đơn hàng
- Reset `lastCheckedOrderId` bằng cách refresh trang

### Performance issues:
- Tăng thời gian interval (ví dụ: 10 giây thay vì 5 giây)
- Kiểm tra API response time 