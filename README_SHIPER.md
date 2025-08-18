# SHIPER API - Hệ thống quản lý giao hàng

## Mô tả
API này cung cấp đầy đủ các chức năng để xây dựng ứng dụng Expo Shiper với các tính năng quản lý đơn hàng, theo dõi trạng thái giao hàng, và quản lý shiper.

## Tính năng chính

### 🔐 Authentication & Profile
- Đăng ký/Đăng nhập shiper với JWT
- Quản lý hồ sơ cá nhân
- Cập nhật thông tin xe cộ và giấy tờ
- Xác minh tài khoản

### 📦 Order Management
- Xem danh sách đơn hàng được assign
- Chi tiết đơn hàng với thông tin khách hàng
- Tìm kiếm và lọc đơn hàng
- Theo dõi trạng thái real-time

### 🚚 Delivery Status Update
- Cập nhật trạng thái giao hàng
- Chụp ảnh chứng minh giao hàng
- Ghi chú và báo cáo sự cố
- Tracking history chi tiết

### 💰 Payment Update
- Xác nhận thanh toán COD
- Xử lý chênh lệch tiền thu hộ
- Báo cáo vấn đề thanh toán

### 📱 Notifications & Support
- WebSocket real-time updates
- Push notifications
- Báo cáo sự cố và khiếu nại
- Liên lạc với admin

### 📊 Reporting & Analytics
- Thống kê hiệu suất giao hàng
- Báo cáo doanh thu và khoảng cách
- Đánh giá từ khách hàng
- Phân tích hiệu suất

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 16+
- MongoDB 6+
- Redis (tùy chọn, cho caching)

### Cài đặt dependencies
```bash
npm install
```

### Cấu hình môi trường
Tạo file `.env` với các biến sau:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/shiper_db
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Chạy ứng dụng
```bash
# Development
npm run dev

# Production
npm start
```

## Cấu trúc API

### Base URL
```
http://localhost:3000/api
```

### Endpoints chính

#### Shiper Routes
- `POST /shipers/register` - Đăng ký shiper
- `POST /shipers/login` - Đăng nhập shiper
- `GET /shipers/profile` - Lấy thông tin profile
- `PUT /shipers/profile` - Cập nhật profile
- `PUT /shipers/location` - Cập nhật vị trí
- `GET /shipers/orders` - Danh sách đơn hàng
- `PUT /shipers/orders/:id/status` - Cập nhật trạng thái

#### Admin Routes
- `GET /admin/shipers` - Quản lý shiper
- `POST /admin/shipers/assign-order` - Assign đơn hàng
- `GET /admin/shipers/statistics` - Thống kê tổng quan

## Sử dụng với Expo App

### 1. Cài đặt dependencies
```bash
expo install expo-location expo-camera expo-notifications
```

### 2. Kết nối API
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động gửi token
api.interceptors.request.use((config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. WebSocket connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('order_assigned', (data) => {
  // Xử lý đơn hàng mới được assign
  console.log('Đơn hàng mới:', data);
});

socket.on('order_status_update', (data) => {
  // Cập nhật trạng thái đơn hàng
  console.log('Cập nhật trạng thái:', data);
});
```

### 4. Cập nhật vị trí real-time
```javascript
import * as Location from 'expo-location';

const updateLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  const location = await Location.getCurrentPositionAsync({});
  
  await api.put('/shipers/location', {
    longitude: location.coords.longitude,
    latitude: location.coords.latitude,
    address: 'Địa chỉ hiện tại'
  });
};

// Cập nhật vị trí mỗi 30 giây
setInterval(updateLocation, 30000);
```

## Database Schema

### Shiper Collection
```javascript
{
  userId: ObjectId,
  fullName: String,
  phone: String,
  email: String,
  vehicleType: String,
  vehicleInfo: Object,
  documents: Object,
  status: String,
  isVerified: Boolean,
  currentLocation: GeoJSON Point,
  workingHours: Object,
  statistics: Object
}
```

### ShiperOrder Collection
```javascript
{
  orderId: ObjectId,
  shiperId: ObjectId,
  status: String,
  pickupLocation: GeoJSON Point,
  deliveryLocation: GeoJSON Point,
  trackingHistory: Array,
  codAmount: Number,
  deliveryFee: Number
}
```

## WebSocket Events

### Server → Client
- `order_assigned` - Đơn hàng mới được assign
- `order_status_update` - Cập nhật trạng thái đơn hàng
- `shiper_location_update` - Cập nhật vị trí shiper
- `new_shiper_report` - Báo cáo mới từ shiper

### Client → Server
- `join` - Tham gia room theo userId
- `disconnect` - Ngắt kết nối

## Bảo mật

### JWT Authentication
- Token có thời hạn 7 ngày
- Tự động refresh khi cần thiết
- Role-based access control

### Validation
- Input validation với express-validator
- Sanitization dữ liệu đầu vào
- Rate limiting cho API endpoints

## Monitoring & Logging

### Logs
- Console logging cho development
- File logging cho production
- Error tracking và reporting

### Metrics
- API response times
- Database query performance
- WebSocket connection stats

## Deployment

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB Atlas
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring tools
- [ ] Configure backup strategy

### Docker (Tùy chọn)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Testing

### API Testing
```bash
# Sử dụng Postman hoặc curl
curl -X POST http://localhost:3000/api/shipers/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Unit Testing
```bash
npm test
```

## Troubleshooting

### Lỗi thường gặp

#### 1. Kết nối MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Giải pháp:** Kiểm tra MongoDB service và connection string

#### 2. JWT Token expired
```
Error: TokenExpiredError: jwt expired
```
**Giải pháp:** Implement token refresh logic

#### 3. WebSocket connection failed
```
Error: WebSocket connection to 'ws://localhost:3000' failed
```
**Giải pháp:** Kiểm tra CORS và WebSocket configuration

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License - xem file LICENSE để biết thêm chi tiết

## Support

- Email: support@example.com
- Documentation: [API Docs](./SHIPER_API_DOCUMENTATION.md)
- Issues: GitHub Issues

---

**Lưu ý:** Đây là phiên bản beta, vui lòng test kỹ trước khi sử dụng trong production.
