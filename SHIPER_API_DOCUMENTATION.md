# SHIPER API DOCUMENTATION

## Tổng quan
API này cung cấp các endpoint để quản lý shiper, đơn hàng giao hàng và theo dõi trạng thái giao hàng.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Sử dụng JWT Bearer Token trong header:
```
Authorization: Bearer <token>
```

---

## 1. AUTHENTICATION & PROFILE

### 1.1 Đăng ký shiper
```
POST /shipers/register
```

**Request Body:**
```json
{
  "email": "shiper@example.com",
  "phone": "0123456789",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "vehicleType": "motorcycle",
  "vehicleInfo": {
    "brand": "Honda",
    "model": "Wave Alpha",
    "licensePlate": "51A-12345",
    "color": "Đen"
  }
}
```

**Response:**
```json
{
  "message": "Đăng ký shiper thành công",
  "token": "jwt_token_here",
  "shiper": {
    "id": "shiper_id",
    "fullName": "Nguyễn Văn A",
    "email": "shiper@example.com",
    "phone": "0123456789",
    "status": "pending",
    "vehicleType": "motorcycle"
  }
}
```

### 1.2 Đăng nhập shiper
```
POST /shipers/login
```

**Request Body:**
```json
{
  "email": "shiper@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Đăng nhập thành công",
  "token": "jwt_token_here",
  "shiper": {
    "id": "shiper_id",
    "fullName": "Nguyễn Văn A",
    "email": "shiper@example.com",
    "phone": "0123456789",
    "status": "active",
    "vehicleType": "motorcycle",
    "avatar": "avatar_url",
    "isVerified": true
  }
}
```

### 1.3 Lấy thông tin profile
```
GET /shipers/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Lấy thông tin profile thành công",
  "shiper": {
    "_id": "shiper_id",
    "fullName": "Nguyễn Văn A",
    "phone": "0123456789",
    "email": "shiper@example.com",
    "avatar": "avatar_url",
    "vehicleType": "motorcycle",
    "vehicleInfo": {...},
    "status": "active",
    "isVerified": true,
    "currentLocation": {...},
    "workingHours": {...},
    "statistics": {...}
  }
}
```

### 1.4 Cập nhật profile
```
PUT /shipers/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "phone": "0987654321",
  "vehicleInfo": {
    "brand": "Yamaha",
    "model": "Exciter 150"
  }
}
```

### 1.5 Cập nhật vị trí
```
PUT /shipers/location
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "longitude": 105.8412,
  "latitude": 21.0245,
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

### 1.6 Cập nhật trạng thái làm việc
```
PUT /shipers/working-status
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isWorking": true,
  "startTime": "08:00",
  "endTime": "18:00"
}
```

---

## 2. ORDER MANAGEMENT

### 2.1 Lấy danh sách đơn hàng
```
GET /shipers/orders?status=assigned&page=1&limit=10&search=keyword
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Trạng thái đơn hàng (assigned, picked_up, in_transit, delivered, failed, returned, cancelled, all)
- `page`: Số trang (mặc định: 1)
- `limit`: Số item mỗi trang (mặc định: 10)
- `search`: Tìm kiếm theo mã đơn hoặc địa chỉ

**Response:**
```json
{
  "message": "Lấy danh sách đơn hàng thành công",
  "orders": [
    {
      "_id": "order_id",
      "orderId": {
        "orderCode": "ORD001",
        "totalAmount": 500000,
        "paymentMethod": "cod"
      },
      "status": "assigned",
      "pickupLocation": {...},
      "deliveryLocation": {...},
      "codAmount": 500000,
      "deliveryFee": 30000,
      "assignedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### 2.2 Lấy chi tiết đơn hàng
```
GET /shipers/orders/:orderId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Lấy chi tiết đơn hàng thành công",
  "order": {
    "_id": "shiper_order_id",
    "orderId": {
      "orderCode": "ORD001",
      "totalAmount": 500000,
      "paymentMethod": "cod",
      "userId": {
        "fullName": "Khách hàng A",
        "phone": "0123456789",
        "email": "customer@example.com"
      },
      "orderDetails": [
        {
          "productId": {
            "name": "Sản phẩm A",
            "images": ["image1.jpg"],
            "price": 250000
          },
          "quantity": 2
        }
      ]
    },
    "status": "assigned",
    "pickupLocation": {...},
    "deliveryLocation": {...},
    "codAmount": 500000,
    "deliveryFee": 30000
  }
}
```

---

## 3. DELIVERY STATUS UPDATE

### 3.1 Cập nhật trạng thái đơn hàng
```
PUT /shipers/orders/:orderId/status
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "picked_up",
  "note": "Đã lấy hàng từ cửa hàng",
  "location": {
    "longitude": 105.8412,
    "latitude": 21.0245,
    "address": "123 Đường ABC"
  }
}
```

**Các trạng thái:**
- `assigned`: Đã được assign
- `picked_up`: Đã lấy hàng từ cửa hàng
- `in_transit`: Đang giao hàng
- `delivered`: Giao thành công
- `failed`: Giao thất bại
- `returned`: Trả hàng
- `cancelled`: Hủy đơn

### 3.2 Xác nhận giao hàng thành công
```
PUT /shipers/orders/:orderId/confirm-delivery
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "deliveryProof": "proof_image_url",
  "signature": "customer_signature",
  "note": "Giao hàng thành công",
  "actualCodAmount": 500000
}
```

---

## 4. PAYMENT UPDATE

### 4.1 Cập nhật trạng thái thanh toán COD
```
PUT /shipers/orders/:orderId/payment
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "paymentStatus": "collected",
  "actualCodAmount": 500000,
  "reason": "Khách hàng thanh toán đúng"
}
```

---

## 5. REPORTING

### 5.1 Tạo báo cáo sự cố
```
POST /shipers/reports
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "delivery_failed",
  "title": "Không thể giao hàng",
  "description": "Khách hàng không có nhà",
  "severity": "medium",
  "location": {
    "longitude": 105.8412,
    "latitude": 21.0245,
    "address": "123 Đường ABC"
  },
  "photos": ["photo1.jpg", "photo2.jpg"]
}
```

**Các loại báo cáo:**
- `delivery_failed`: Giao hàng thất bại
- `customer_complaint`: Khiếu nại khách hàng
- `vehicle_issue`: Vấn đề xe cộ
- `road_issue`: Vấn đề đường xá
- `weather_issue`: Vấn đề thời tiết
- `package_damage`: Hàng hóa bị hư hỏng
- `address_issue`: Vấn đề địa chỉ
- `payment_issue`: Vấn đề thanh toán
- `other`: Khác

### 5.2 Lấy danh sách báo cáo
```
GET /shipers/reports?status=pending&type=delivery_failed&page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <token>
```

---

## 6. STATISTICS

### 6.1 Lấy thống kê shiper
```
GET /shipers/statistics?startDate=2024-01-01&endDate=2024-01-31
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Lấy thống kê thành công",
  "statistics": {
    "totalOrders": 50,
    "completedOrders": 45,
    "failedOrders": 3,
    "totalEarnings": 1500000,
    "totalDistance": 250,
    "averageRating": 4.5,
    "totalReviews": 40
  }
}
```

---

## 7. ADMIN SHIPER MANAGEMENT

### 7.1 Lấy danh sách tất cả shiper
```
GET /admin/shipers?status=active&isVerified=true&page=1&limit=10&search=keyword
```

**Query Parameters:**
- `status`: Trạng thái shiper (active, inactive, suspended, pending, all)
- `isVerified`: Trạng thái xác minh (true, false)
- `page`: Số trang
- `limit`: Số item mỗi trang
- `search`: Tìm kiếm theo tên, email, số điện thoại

### 7.2 Cập nhật trạng thái shiper
```
PUT /admin/shipers/:shiperId/status
```

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Vi phạm quy định"
}
```

### 7.3 Xác minh shiper
```
PUT /admin/shipers/:shiperId/verify
```

**Request Body:**
```json
{
  "isVerified": true,
  "notes": "Đã xác minh đầy đủ giấy tờ"
}
```

### 7.4 Lấy danh sách đơn hàng cần assign
```
GET /admin/shipers/orders-to-assign?priority=high&page=1&limit=10
```

### 7.5 Assign đơn hàng cho shiper
```
POST /admin/shipers/assign-order
```

**Request Body:**
```json
{
  "orderId": "order_id",
  "shiperId": "shiper_id"
}
```

### 7.6 Hủy assign đơn hàng
```
DELETE /admin/shipers/orders/:orderId/assign
```

**Request Body:**
```json
{
  "reason": "Shiper không phù hợp"
}
```

### 7.7 Lấy vị trí shiper
```
GET /admin/shipers/:shiperId/location
```

### 7.8 Lấy danh sách shiper đang hoạt động
```
GET /admin/shipers/active-shipers?vehicleType=motorcycle
```

### 7.9 Lấy thống kê tổng quan
```
GET /admin/shipers/statistics?startDate=2024-01-01&endDate=2024-01-31
```

### 7.10 Lấy báo cáo hiệu suất
```
GET /admin/shipers/performance?startDate=2024-01-01&endDate=2024-01-31&shiperId=shiper_id
```

---

## 8. ERROR CODES

### HTTP Status Codes
- `200`: Thành công
- `201`: Tạo thành công
- `400`: Bad Request - Dữ liệu không hợp lệ
- `401`: Unauthorized - Không có token hoặc token không hợp lệ
- `403`: Forbidden - Không có quyền truy cập
- `404`: Not Found - Không tìm thấy tài nguyên
- `500`: Internal Server Error - Lỗi server

### Error Response Format
```json
{
  "message": "Mô tả lỗi",
  "error": "Chi tiết lỗi (nếu có)"
}
```

---

## 9. WEBSOCKET EVENTS

### Events từ Server
- `order_assigned`: Đơn hàng được assign
- `order_status_update`: Cập nhật trạng thái đơn hàng
- `shiper_location_update`: Cập nhật vị trí shiper
- `new_shiper_report`: Báo cáo mới từ shiper

### Events từ Client
- `join`: Tham gia room theo userId
- `disconnect`: Ngắt kết nối

---

## 10. VALIDATION RULES

### Email
- Phải là email hợp lệ

### Phone
- Phải là số điện thoại Việt Nam hợp lệ

### Password
- Tối thiểu 6 ký tự

### Coordinates
- Longitude: -180 đến 180
- Latitude: -90 đến 90

### Vehicle Type
- Các giá trị: motorcycle, bicycle, car, truck

### Order Status
- Các giá trị: assigned, picked_up, in_transit, delivered, failed, returned, cancelled

### Report Type
- Các giá trị: delivery_failed, customer_complaint, vehicle_issue, road_issue, weather_issue, package_damage, address_issue, payment_issue, other

---

## 11. EXAMPLES

### Flow hoàn chỉnh giao hàng

1. **Admin assign đơn hàng**
```bash
POST /api/admin/shipers/assign-order
{
  "orderId": "order_id",
  "shiperId": "shiper_id"
}
```

2. **Shiper nhận thông báo qua WebSocket**
```javascript
socket.on('order_assigned', (data) => {
  console.log('Đơn hàng mới:', data);
});
```

3. **Shiper cập nhật trạng thái lấy hàng**
```bash
PUT /api/shipers/orders/order_id/status
{
  "status": "picked_up",
  "note": "Đã lấy hàng từ cửa hàng"
}
```

4. **Shiper cập nhật trạng thái đang giao**
```bash
PUT /api/shipers/orders/order_id/status
{
  "status": "in_transit"
}
```

5. **Shiper xác nhận giao hàng thành công**
```bash
PUT /api/shipers/orders/order_id/confirm-delivery
{
  "deliveryProof": "proof_image_url",
  "signature": "customer_signature"
}
```

### Cập nhật vị trí real-time
```bash
PUT /api/shipers/location
{
  "longitude": 105.8412,
  "latitude": 21.0245,
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

---

## 12. NOTES

- Tất cả API đều sử dụng JWT authentication (trừ register và login)
- Vị trí được lưu dưới dạng GeoJSON Point với coordinates [longitude, latitude]
- WebSocket được sử dụng để real-time updates
- File upload (ảnh) được xử lý qua API upload riêng biệt
- Pagination được áp dụng cho tất cả API list
- Validation được thực hiện ở cả client và server
- Error handling được chuẩn hóa theo format chung
