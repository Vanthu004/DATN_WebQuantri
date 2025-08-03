# 🎯 Hướng dẫn sử dụng chức năng cấp quyền người dùng

## 📋 Tổng quan

Chức năng cấp quyền cho phép admin thay đổi role của người dùng trong hệ thống. Hệ thống hỗ trợ 3 loại role:

- **👑 Admin**: Quyền cao nhất, có thể quản lý toàn bộ hệ thống
- **🛒 Customer**: Khách hàng, có thể đặt hàng và quản lý thông tin cá nhân
- **👤 User**: Người dùng cơ bản

## 🔧 Cài đặt Backend

### 1. Cập nhật User Model (`src/models/user.js`)

Model đã có sẵn trường `role` với enum values:
```javascript
role: {
  type: String,
  enum: ["admin", "customer", "user"],
  default: "user",
}
```

### 2. Cập nhật User Controller (`src/controllers/userController.js`)

Đã thêm các functions:
- `updateUser()`: Cập nhật thông tin user (bao gồm role)
- `updateUserRole()`: Function riêng để cập nhật role
- `blockUser()`: Cải thiện với kiểm tra quyền

### 3. Cập nhật Router (`src/routers/userRouter.js`)

Đã thêm endpoint:
```javascript
router.patch("/:id/role", authMiddleware, userController.updateUserRole);
```

## 🎨 Cài đặt Frontend

### 1. Service Layer (`admin/src/services/user.ts`)

```typescript
// Cập nhật role cho user
export const updateUserRole = async (
  id: string,
  role: "admin" | "customer" | "user",
  token: string
) => {
  return api.patch(`/users/${id}/role`, { role }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
```

### 2. Interface (`admin/src/interfaces/user.ts`)

```typescript
export default interface User {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "customer" | "user";
  // ... other fields
}

export interface UpdateRoleResponse {
  message: string;
  user: User;
  previousRole?: string;
  newRole?: string;
}
```

### 3. Components

#### UserRoleManager Component
- **File**: `admin/src/components/UserRoleManager.tsx`
- **Chức năng**: UI để thay đổi role của user
- **Features**:
  - Dropdown chọn role
  - Validation quyền
  - Loading states
  - Error handling
  - Success messages

#### UserManagementPage Component
- **File**: `admin/src/pages/users/UserManagementPage.tsx`
- **Chức năng**: Trang quản lý user với chức năng cấp quyền
- **Features**:
  - Danh sách tất cả users
  - Thống kê theo role
  - Panel quản lý role
  - Responsive design

## 🚀 Cách sử dụng

### 1. Truy cập trang quản lý user
```
URL: /users/manage
```

### 2. Chọn user cần cấp quyền
- Click vào user trong danh sách
- User được chọn sẽ hiển thị trong panel bên phải

### 3. Thay đổi role
- Chọn role mới từ dropdown
- Click "Cập nhật quyền"
- Xác nhận thay đổi

## 🔒 Bảo mật

### Kiểm tra quyền
- Chỉ admin mới có thể thay đổi role
- Admin không thể hạ cấp chính mình
- Validation role values

### API Endpoints bảo vệ
```javascript
// Middleware kiểm tra quyền
if (req.user.role !== 'admin') {
  return res.status(403).json({ 
    message: "Bạn không có quyền thay đổi role của người dùng" 
  });
}
```

## 📊 API Endpoints

### 1. Cập nhật role
```
PATCH /api/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin" | "customer" | "user"
}
```

**Response:**
```json
{
  "message": "Đã cập nhật role của người dùng thành admin",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    // ... other fields
  },
  "previousRole": "user",
  "newRole": "admin"
}
```

### 2. Cập nhật user (bao gồm role)
```
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "role": "admin",
  // ... other fields
}
```

## 🎨 UI Features

### Role Badges
- **Admin**: 🔴 Red background
- **Customer**: 🔵 Blue background  
- **User**: ⚫ Gray background

### Interactive Elements
- Hover effects trên table rows
- Loading states cho buttons
- Success/Error messages
- Disabled states khi không có quyền

### Responsive Design
- Mobile-friendly layout
- Grid system cho statistics
- Collapsible panels

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **"Bạn không có quyền thay đổi role"**
   - Kiểm tra user hiện tại có role admin không
   - Kiểm tra token có hợp lệ không

2. **"Role không hợp lệ"**
   - Role phải là: "admin", "customer", hoặc "user"
   - Kiểm tra case sensitivity

3. **"Bạn không thể hạ cấp chính mình"**
   - Admin không thể tự hạ cấp role của chính mình
   - Cần admin khác thực hiện

### Debug
- Kiểm tra console logs
- Xem network requests trong DevTools
- Verify token trong localStorage

## 🔄 Cập nhật tương lai

### Tính năng có thể thêm:
- [ ] Lịch sử thay đổi role
- [ ] Email notification khi role thay đổi
- [ ] Role hierarchy (role levels)
- [ ] Temporary role assignments
- [ ] Bulk role updates
- [ ] Role-based permissions matrix

### Performance improvements:
- [ ] Caching user data
- [ ] Pagination cho danh sách users
- [ ] Real-time updates với WebSocket
- [ ] Optimistic updates

## 📝 Notes

- Chức năng này chỉ dành cho admin
- Cần backup database trước khi thay đổi role quan trọng
- Log tất cả thay đổi role để audit
- Test kỹ trước khi deploy production 