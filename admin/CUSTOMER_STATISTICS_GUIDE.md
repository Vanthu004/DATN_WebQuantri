# Hướng dẫn sử dụng tính năng Thống kê Khách hàng

## Tổng quan
Tính năng Thống kê Khách hàng cung cấp cái nhìn tổng quan về tình hình khách hàng của hệ thống, bao gồm các chỉ số quan trọng như tổng số khách hàng, tỷ lệ chuyển đổi, doanh thu và phân tích khách hàng tiềm năng.

## Cách truy cập
1. Đăng nhập vào hệ thống admin
2. Vào menu "Thống kê" (trang chủ)
3. Chọn tab "Khách hàng" trong phần thống kê

## Các tính năng chính

### 1. Bộ lọc thời gian
- **Tuần này**: Thống kê trong 7 ngày gần nhất
- **Tháng này**: Thống kê từ đầu tháng hiện tại
- **Quý này**: Thống kê từ đầu quý hiện tại
- **Năm nay**: Thống kê từ đầu năm hiện tại

### 2. Thống kê tổng quan
- **Tổng khách hàng**: Số lượng khách hàng đã đăng ký
- **Khách có đơn hàng**: Số khách hàng đã mua hàng ít nhất một lần
- **Khách mới tháng này**: Số khách hàng mới đăng ký trong tháng
- **Khách hàng tích cực**: Số khách hàng có hoạt động trong 3 tháng gần đây

### 3. Phân tích doanh thu
- **Tổng doanh thu**: Tổng doanh thu từ tất cả khách hàng
- **Giá trị đơn hàng TB**: Giá trị trung bình của mỗi đơn hàng
- **Tỷ lệ giữ chân**: Phần trăm khách hàng quay lại mua hàng
- **Tỷ lệ chuyển đổi**: Phần trăm khách hàng từ đăng ký thành mua hàng

### 4. Top khách hàng tiềm năng
Bảng hiển thị top 10 khách hàng theo:
- Tên và thông tin liên hệ
- Ngày tham gia
- Số lượng đơn hàng
- Tổng chi tiêu

### 5. Phân tích chi tiết
- **Tổng quan**: Tóm tắt tình hình khách hàng
- **Khách hàng mới**: Phân tích tăng trưởng khách hàng mới
- **Doanh thu**: Phân tích doanh thu và giá trị đơn hàng
- **Chất lượng**: Đánh giá tỷ lệ giữ chân và khách hàng tích cực

## API Endpoints

### 1. Lấy thống kê khách hàng
```
GET /api/users/statistics?timeRange={timeRange}
```
**Parameters:**
- `timeRange`: week, month, quarter, year

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 1250,
    "customersWithOrders": 890,
    "newCustomersThisMonth": 45,
    "activeCustomers": 650,
    "totalRevenue": 125000000,
    "averageOrderValue": 450000,
    "customerRetentionRate": 78.5
  }
}
```

### 2. Lấy top khách hàng
```
GET /api/users/top-customers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "Tên khách hàng",
      "email": "email@example.com",
      "role": "customer",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "orderCount": 15,
      "totalSpent": 2500000
    }
  ]
}
```

## Cấu trúc dữ liệu

### CustomerStats Interface
```typescript
interface CustomerStats {
  totalCustomers: number;           // Tổng số khách hàng
  customersWithOrders: number;      // Số khách có đơn hàng
  newCustomersThisMonth: number;    // Khách mới tháng này
  activeCustomers: number;          // Khách hàng tích cực
  totalRevenue: number;             // Tổng doanh thu
  averageOrderValue: number;        // Giá trị đơn hàng TB
  customerRetentionRate: number;    // Tỷ lệ giữ chân (%)
}
```

### CustomerData Interface
```typescript
interface CustomerData {
  _id: string;                      // ID khách hàng
  name: string;                     // Tên khách hàng
  email: string;                    // Email
  role: string;                     // Vai trò
  createdAt: string;                // Ngày tạo
  orderCount?: number;              // Số đơn hàng
  totalSpent?: number;              // Tổng chi tiêu
}
```

## Xử lý lỗi

### Fallback Data
Khi API không hoạt động, component sẽ hiển thị dữ liệu mẫu để demo:
- Tổng khách hàng: 1,250
- Khách có đơn hàng: 890
- Khách mới tháng này: 45
- Khách hàng tích cực: 650

### Error Handling
- Hiển thị loading spinner khi đang tải dữ liệu
- Log lỗi vào console để debug
- Fallback về dữ liệu mẫu nếu có lỗi

## Responsive Design
- **Desktop**: Hiển thị đầy đủ thông tin với layout grid
- **Tablet**: Tự động điều chỉnh số cột
- **Mobile**: Chuyển về layout 1 cột, bảng có thể scroll ngang

## Tùy chỉnh giao diện

### CSS Classes chính
- `.customer-stats-container`: Container chính
- `.customer-stats-grid`: Grid cho các thẻ thống kê
- `.customer-stat-card`: Thẻ thống kê đơn lẻ
- `.top-customers-table`: Bảng top khách hàng
- `.customer-insights`: Phần phân tích chi tiết

### Màu sắc
- **Blue**: Thông tin chính, tổng quan
- **Green**: Khách hàng, doanh thu
- **Purple**: Sản phẩm, khách mới
- **Orange**: Xu hướng, tăng trưởng
- **Indigo**: Khách hàng, phân tích

## Lưu ý quan trọng

### Performance
- API calls được thực hiện khi component mount và khi thay đổi timeRange
- Sử dụng useEffect để tránh gọi API không cần thiết
- Fallback data giúp tránh lỗi khi API không hoạt động

### Security
- Tất cả API endpoints yêu cầu authentication
- Sử dụng JWT token từ localStorage
- Chỉ admin mới có thể truy cập thống kê

### Data Accuracy
- Thống kê dựa trên dữ liệu thực từ database
- Cập nhật real-time khi có dữ liệu mới
- Có thể có độ trễ nhỏ do tính toán aggregate

## Troubleshooting

### Lỗi thường gặp
1. **"Không tìm thấy token đăng nhập"**: Kiểm tra localStorage và đăng nhập lại
2. **API không phản hồi**: Kiểm tra backend server và network
3. **Dữ liệu không cập nhật**: Refresh trang hoặc kiểm tra timeRange

### Debug
- Mở Developer Tools > Console để xem log
- Kiểm tra Network tab để xem API calls
- Sử dụng React DevTools để kiểm tra component state

## Phát triển tương lai

### Tính năng có thể thêm
- Export dữ liệu ra Excel/PDF
- Biểu đồ trực quan hóa dữ liệu
- So sánh theo thời gian
- Phân tích theo địa lý
- Gửi báo cáo tự động qua email

### Tối ưu hóa
- Caching dữ liệu thống kê
- Lazy loading cho bảng lớn
- Real-time updates với WebSocket
- Offline support với Service Worker 