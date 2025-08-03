# Hướng dẫn sử dụng chức năng thống kê doanh thu và sản phẩm bán chạy

## Tổng quan

Hệ thống thống kê doanh thu và sản phẩm bán chạy được thiết kế với kiến trúc kết hợp:
- **Thêm trường vào bảng hiện có**: Cập nhật Product model với các trường thống kê
- **Model mới**: SalesStatistics để lưu thống kê chi tiết theo thời gian
- **Cron jobs**: Tự động cập nhật thống kê hàng ngày/tuần/tháng
- **Real-time updates**: Cập nhật thống kê khi có đơn hàng mới

## Cấu trúc dữ liệu

### 1. Product Model (đã cập nhật)

```javascript
// Các trường mới được thêm
sold_quantity: Number,        // Tổng số lượng đã bán
revenue: Number,              // Tổng doanh thu từ sản phẩm
last_sold_at: Date,          // Lần bán cuối cùng
sales_stats: {
  daily: Number,             // Số lượng bán trong ngày
  weekly: Number,            // Số lượng bán trong tuần
  monthly: Number,           // Số lượng bán trong tháng
  yearly: Number             // Số lượng bán trong năm
}
```

### 2. SalesStatistics Model (mới)

```javascript
{
  type: String,              // "daily", "weekly", "monthly", "yearly", "custom"
  date: Date,                // Ngày thống kê
  revenue: Number,           // Doanh thu
  order_count: Number,       // Số đơn hàng
  product_sold_count: Number, // Số sản phẩm bán ra
  top_products: Array,       // Top sản phẩm bán chạy
  category_stats: Array,     // Thống kê theo danh mục
  payment_method_stats: Array, // Thống kê theo phương thức thanh toán
  order_status_stats: Array, // Thống kê theo trạng thái đơn hàng
  metadata: Object,          // Metadata khác
  is_processed: Boolean      // Trạng thái xử lý
}
```

## API Endpoints

### 1. Thống kê doanh thu theo thời gian
```
GET /api/sales-statistics/revenue?type=daily&start_date=2024-01-01&end_date=2024-01-31&limit=30
```

**Parameters:**
- `type`: "daily", "weekly", "monthly", "yearly" (default: "daily")
- `start_date`: Ngày bắt đầu (YYYY-MM-DD)
- `end_date`: Ngày kết thúc (YYYY-MM-DD)
- `limit`: Số lượng kết quả (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "2024-01-01",
      "revenue": 1500000,
      "order_count": 25,
      "product_sold_count": 150
    }
  ],
  "type": "daily",
  "total_revenue": 45000000,
  "total_orders": 750
}
```

### 2. Thống kê sản phẩm bán chạy
```
GET /api/sales-statistics/top-products?period=30d&limit=10&category_id=123
```

**Parameters:**
- `period`: "7d", "30d", "90d", "all" (default: "all")
- `start_date`: Ngày bắt đầu (YYYY-MM-DD)
- `end_date`: Ngày kết thúc (YYYY-MM-DD)
- `limit`: Số lượng sản phẩm (default: 10)
- `category_id`: ID danh mục (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "product_name": "Áo thun nam",
      "product_image": "image_url",
      "category_name": "Thời trang nam",
      "quantity_sold": 150,
      "revenue": 7500000,
      "order_count": 45
    }
  ],
  "period": "30d",
  "total_products": 10
}
```

### 3. Thống kê tổng quan dashboard
```
GET /api/sales-statistics/dashboard?period=30d
```

**Parameters:**
- `period`: "7d", "30d", "90d" (default: "30d")

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "revenue": {
      "total_revenue": 45000000,
      "order_count": 750,
      "avg_order_value": 60000
    },
    "top_products": [...],
    "category_stats": [...],
    "order_status_stats": [...],
    "customer_stats": {
      "total_customers": 500,
      "average_order_value": 60000
    }
  }
}
```

### 4. Lấy thống kê theo khoảng thời gian
```
GET /api/sales-statistics/date-range?start_date=2024-01-01&end_date=2024-01-31&type=daily
```

### 5. Tạo thống kê theo ngày (cron job)
```
POST /api/sales-statistics/generate-daily
```

## Cron Jobs

### 1. Khởi động cron jobs
```javascript
const { startCronJobs } = require('./src/cron/salesStatisticsCron');

// Trong file app.js hoặc server.js
startCronJobs();
```

### 2. Lịch trình cron jobs
- **00:00 hàng ngày**: Reset thống kê daily
- **00:01 hàng ngày**: Tạo thống kê cho ngày hôm qua
- **00:00 Chủ nhật**: Reset thống kê weekly
- **00:00 ngày 1 hàng tháng**: Reset thống kê monthly

## Middleware

### 1. Tự động cập nhật thống kê sản phẩm

```javascript
const { 
  updateProductStatsOnOrderCreate,
  updateProductStatsOnOrderUpdate,
  updateProductStatsOnOrderDetailCreate 
} = require('./src/middleware/updateProductStats');

// Áp dụng middleware cho các route
router.post('/orders', updateProductStatsOnOrderCreate, orderController.createOrder);
router.put('/orders/:id', updateProductStatsOnOrderUpdate, orderController.updateOrder);
router.post('/order-details', updateProductStatsOnOrderDetailCreate, orderDetailController.createOrderDetail);
```

## Cách sử dụng

### 1. Cài đặt dependencies
```bash
npm install node-cron
```

### 2. Thêm router vào app.js
```javascript
const salesStatisticsRouter = require('./src/routers/salesStatisticsRouter');
app.use('/api/sales-statistics', salesStatisticsRouter);
```

### 3. Khởi động cron jobs
```javascript
const { startCronJobs } = require('./src/cron/salesStatisticsCron');
startCronJobs();
```

### 4. Áp dụng middleware
```javascript
const { updateProductStatsOnOrderCreate } = require('./src/middleware/updateProductStats');
app.use('/api/orders', updateProductStatsOnOrderCreate);
```

## Ví dụ sử dụng

### 1. Lấy thống kê doanh thu 30 ngày gần nhất
```javascript
const response = await fetch('/api/sales-statistics/revenue?type=daily&limit=30');
const data = await response.json();
console.log(data.data); // Array thống kê theo ngày
```

### 2. Lấy top 10 sản phẩm bán chạy trong tháng
```javascript
const response = await fetch('/api/sales-statistics/top-products?period=30d&limit=10');
const data = await response.json();
console.log(data.data); // Array top sản phẩm
```

### 3. Lấy thống kê dashboard
```javascript
const response = await fetch('/api/sales-statistics/dashboard?period=30d');
const data = await response.json();
console.log(data.data); // Object thống kê tổng quan
```

## Lưu ý quan trọng

1. **Performance**: Hệ thống sử dụng cache (SalesStatistics) để tối ưu hiệu suất
2. **Real-time**: Thống kê được cập nhật real-time khi có đơn hàng mới
3. **Backup**: Nên backup dữ liệu SalesStatistics định kỳ
4. **Monitoring**: Theo dõi log của cron jobs để đảm bảo chạy đúng
5. **Scaling**: Có thể scale bằng cách tách riêng service thống kê

## Troubleshooting

### 1. Cron job không chạy
- Kiểm tra timezone của server
- Kiểm tra log để xem lỗi
- Đảm bảo process không bị kill

### 2. Thống kê không chính xác
- Kiểm tra trạng thái đơn hàng (chỉ tính "Đã giao hàng", "Hoàn thành")
- Kiểm tra payment_status (chỉ tính "paid")
- Verify dữ liệu trong SalesStatistics

### 3. Performance chậm
- Kiểm tra index trong database
- Tối ưu aggregation pipeline
- Sử dụng cache cho các query phức tạp 