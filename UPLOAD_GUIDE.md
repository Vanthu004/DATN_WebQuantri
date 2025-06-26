# Hướng dẫn sử dụng Upload Router

## Tổng quan
Hệ thống upload đã được cập nhật để sử dụng `uploadRouter` thay vì xử lý upload trực tiếp trong `userController`. Upload sẽ được lưu vào AWS S3 và thông tin được lưu trong database.

## Các API Upload

### 1. Upload ảnh
**POST** `/api/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
```
image: <file> (bắt buộc)
relatedModel: "User" (tùy chọn)
relatedId: <id> (tùy chọn)
```

**Response:**
```json
{
  "message": "Upload thành công",
  "upload": {
    "_id": "upload_id",
    "fileName": "generated_filename.jpg",
    "originalName": "original_name.jpg",
    "mimeType": "image/jpeg",
    "size": 12345,
    "url": "https://bucket.s3.region.amazonaws.com/filename.jpg",
    "uploadedBy": "user_id",
    "relatedTo": {
      "model": "User",
      "id": "user_id"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "url": "https://bucket.s3.region.amazonaws.com/filename.jpg"
}
```

### 2. Lấy danh sách uploads
**GET** `/api/uploads`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "upload_id",
    "fileName": "filename.jpg",
    "originalName": "original.jpg",
    "mimeType": "image/jpeg",
    "size": 12345,
    "url": "https://bucket.s3.region.amazonaws.com/filename.jpg",
    "uploadedBy": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com"
    },
    "relatedTo": {
      "model": "User",
      "id": "user_id"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 3. Xóa upload
**DELETE** `/api/uploads/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Xóa upload thành công"
}
```

## Cập nhật User với Avatar

### 1. Cập nhật thông tin cá nhân (không bao gồm avatar)
**PUT** `/api/users/update-profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "phone_number": "0123456789",
  "address": "User Address",
  "gender": "male",
  "avatar_url": "https://bucket.s3.region.amazonaws.com/avatar.jpg"
}
```

### 2. Cập nhật avatar (sử dụng Upload ID)
**PUT** `/api/users/update-avatar`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "avatarId": "upload_id"
}
```

## Quy trình sử dụng

### Bước 1: Upload ảnh
1. Gọi API `/api/upload` với file ảnh
2. Nhận về `upload_id` và `url`

### Bước 2: Cập nhật user
**Cách 1:** Sử dụng `avatar_url` trong `update-profile`
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "avatar_url": "https://bucket.s3.region.amazonaws.com/avatar.jpg"
}
```

**Cách 2:** Sử dụng `avatarId` trong `update-avatar`
```json
{
  "avatarId": "upload_id"
}
```

## Lưu ý

1. **Kích thước file:** Tối đa 5MB
2. **Định dạng:** Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, GIF)
3. **Authentication:** Tất cả API upload đều yêu cầu xác thực
4. **S3 Configuration:** Cần cấu hình các biến môi trường AWS:
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_BUCKET_NAME`

## Migration từ hệ thống cũ

Hệ thống cũ sử dụng base64 để lưu ảnh trực tiếp trong database. Hệ thống mới:
- Lưu ảnh trên S3
- Lưu thông tin upload trong database
- Hỗ trợ cả `avatar` (ObjectId) và `avata_url` (String) trong User model

Để migrate:
1. Upload ảnh cũ lên S3
2. Tạo record trong Upload collection
3. Cập nhật User với `avatarId` mới 