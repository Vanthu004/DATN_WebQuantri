# 📦 Thống kê kho hàng (Inventory Statistics)

## Tổng quan

Tính năng thống kê kho hàng cho phép admin theo dõi tình trạng kho hàng, số lượng sản phẩm và giá trị tồn kho một cách chi tiết.

## Tính năng chính

### 1. Thống kê tổng quan
- **Tổng sản phẩm**: Số lượng sản phẩm trong kho
- **Tổng số lượng**: Tổng số lượng tất cả sản phẩm
- **Sắp hết hàng**: Sản phẩm có số lượng ≤ 10
- **Hết hàng**: Sản phẩm có số lượng = 0
- **Tổng giá trị kho**: Giá trị tổng kho hàng (quantity × price)

### 2. Danh sách chi tiết
- **Top 5 sản phẩm sắp hết hàng**: Hiển thị sản phẩm có số lượng thấp
- **Top 5 sản phẩm hết hàng**: Hiển thị sản phẩm đã hết hàng
- **Thống kê theo danh mục**: Phân tích theo từng danh mục sản phẩm

## Cấu trúc API

### Endpoint
```
GET /api/products/inventory/stats
```

### Response
```json
{
  "message": "Lấy thống kê kho hàng thành công",
  "stats": {
    "totalProducts": 150,
    "totalQuantity": 2500,
    "lowStockProducts": 8,
    "outOfStockProducts": 3,
    "totalValue": 150000000,
    "lowStockProductsList": [
      {
        "_id": "product_id",
        "name": "Tên sản phẩm",
        "quantity": 5,
        "price": 100000
      }
    ],
    "outOfStockProductsList": [
      {
        "_id": "product_id",
        "name": "Tên sản phẩm",
        "price": 100000
      }
    ],
    "categoryStats": [
      {
        "_id": "Danh mục",
        "count": 25,
        "totalQuantity": 500,
        "totalValue": 50000000
      }
    ]
  }
}
```

## Cài đặt Backend

### 1. Controller (`src/controllers/productController.js`)
```javascript
exports.getInventoryStats = async (req, res) => {
  // Logic tính toán thống kê kho hàng
};
```

### 2. Router (`src/routers/productRouter.js`)
```javascript
router.get('/inventory/stats', prodCtrl.getInventoryStats);
```

## Cài đặt Frontend

### 1. Service (`admin/src/services/inventory.ts`)
```typescript
export const getInventoryStats = async (): Promise<InventoryStatsResponse> => {
  // Gọi API thống kê kho hàng
};
```

### 2. Component (`admin/src/components/InventoryStats.tsx`)
- Hiển thị thống kê tổng quan
- Danh sách sản phẩm sắp hết hàng
- Danh sách sản phẩm hết hàng
- Thống kê theo danh mục

### 3. Page (`admin/src/pages/inventory/InventoryPage.tsx`)
- Trang chính hiển thị thống kê kho hàng

### 4. Route (`admin/src/App.tsx`)
```typescript
<Route path="/inventory" element={<InventoryPage />} />
```

### 5. Menu (`admin/src/components/layouts/LayoutAdmin.tsx`)
```javascript
{
  path: "/inventory",
  icon: <FaWarehouse />,
  label: "Kho hàng",
}
```

## Sử dụng

### 1. Truy cập trang thống kê
- Đăng nhập vào admin panel
- Click vào menu "Kho hàng" trong sidebar
- Hoặc truy cập trực tiếp `/inventory`

### 2. Xem thống kê
- **Thống kê tổng quan**: 4 card hiển thị số liệu chính
- **Giá trị kho hàng**: Card gradient hiển thị tổng giá trị
- **Sản phẩm sắp hết hàng**: Danh sách sản phẩm cần nhập thêm
- **Sản phẩm hết hàng**: Danh sách sản phẩm đã hết
- **Thống kê theo danh mục**: Bảng phân tích theo danh mục

### 3. Tính năng bổ sung
- **Auto-refresh**: Dữ liệu được cập nhật khi load trang
- **Error handling**: Xử lý lỗi và hiển thị thông báo
- **Loading state**: Hiển thị trạng thái đang tải
- **Responsive**: Tương thích với mobile và tablet

## Công nghệ sử dụng

### Backend
- **MongoDB Aggregation**: Tính toán thống kê phức tạp
- **Express.js**: API endpoint
- **Mongoose**: Truy vấn dữ liệu

### Frontend
- **React**: Component-based UI
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Icons**: Icons

## Lưu ý

1. **Performance**: API sử dụng MongoDB aggregation để tối ưu hiệu suất
2. **Real-time**: Dữ liệu được cập nhật khi load trang, không real-time
3. **Authorization**: Cần đăng nhập admin để truy cập
4. **Data accuracy**: Dữ liệu dựa trên trường `quantity` trong model Product

## Mở rộng tương lai

1. **Real-time updates**: WebSocket để cập nhật real-time
2. **Export data**: Xuất báo cáo PDF/Excel
3. **Alerts**: Thông báo khi sản phẩm sắp hết hàng
4. **Historical data**: Theo dõi lịch sử thay đổi kho hàng
5. **Predictive analytics**: Dự đoán nhu cầu nhập hàng 