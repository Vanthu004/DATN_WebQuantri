# Hướng dẫn sử dụng Voucher trong Thanh toán Online

## Tổng quan

Hệ thống thanh toán online đã được cập nhật để hỗ trợ voucher thay vì thuế. Voucher có thể được áp dụng cho cả thanh toán COD và thanh toán online (ZaloPay).

## Thay đổi chính

### 1. Loại bỏ thuế (Tax)
- ❌ Không còn tính thuế trong thanh toán
- ✅ Thay thế bằng voucher discount

### 2. Công thức tính toán mới
```
Tổng tiền = Tổng sản phẩm - Voucher discount + Phí vận chuyển
```

## API Endpoints

### 1. Tính toán voucher cho thanh toán online
```
POST /api/payments/calculate-voucher
```

**Request:**
```json
{
  "voucher_id": "voucher_id",
  "product_total": 1000000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product_total": 1000000,
    "voucher_discount": 100000,
    "final_total": 900000,
    "voucher_info": {
      "voucher_id": "voucher_id",
      "discount_value": 100000,
      "expiry_date": "2024-12-31T23:59:59.000Z",
      "usage_limit": 100,
      "used_count": 50
    }
  }
}
```

### 2. Tạo đơn hàng ZaloPay với voucher
```
POST /api/payments/zalopay/payment
```

**Request:**
```json
{
  "cart_id": "cart_id",
  "items": [...],
  "product_total": 1000000,
  "voucher_discount": 100000,
  "shipping_fee": 30000,
  "app_user": "user123"
}
```

**Response:**
```json
{
  "return_code": 1,
  "return_message": "Success",
  "sub_return_code": 1,
  "sub_return_message": "Success",
  "zp_trans_token": "token",
  "order_url": "https://...",
  "qr_url": "https://...",
  "total_amount": 930000,
  "product_total": 1000000,
  "voucher_discount": 100000,
  "shipping_fee": 30000,
  "app_trans_id": "240105_123456"
}
```

## Frontend Integration

### 1. Service functions
```typescript
import { calculateVoucherForPayment, createZaloPayOrder } from '../services/payment';

// Tính toán voucher trước khi thanh toán
const voucherResult = await calculateVoucherForPayment(voucher_id, product_total);
if (voucherResult.success) {
  console.log('Voucher discount:', voucherResult.data.voucher_discount);
  console.log('Final total:', voucherResult.data.final_total);
}

// Tạo đơn hàng ZaloPay với voucher
const zaloPayResult = await createZaloPayOrder({
  cart_id: "cart_id",
  items: [...],
  product_total: 1000000,
  voucher_discount: 100000,
  shipping_fee: 30000
});
```

### 2. Flow thanh toán với voucher
```typescript
// 1. Người dùng chọn voucher
const selectedVoucher = "voucher_id";

// 2. Tính toán discount
const voucherCalculation = await calculateVoucherForPayment(selectedVoucher, productTotal);

// 3. Hiển thị thông tin cho người dùng
const finalTotal = voucherCalculation.data.final_total + shippingFee;

// 4. Tạo đơn hàng thanh toán
const paymentOrder = await createZaloPayOrder({
  cart_id: cartId,
  items: cartItems,
  product_total: productTotal,
  voucher_discount: voucherCalculation.data.voucher_discount,
  shipping_fee: shippingFee
});
```

## Validation

### 1. Kiểm tra voucher hợp lệ
- ✅ Voucher tồn tại
- ✅ Trạng thái active
- ✅ Chưa hết hạn
- ✅ Chưa hết lượt sử dụng

### 2. Tính toán an toàn
- ✅ Đảm bảo final_total >= 0
- ✅ Không cho phép discount > product_total
- ✅ Cập nhật usage count khi sử dụng

## Lỗi có thể gặp

### 1. Voucher không hợp lệ
```json
{
  "success": false,
  "msg": "Voucher không hợp lệ"
}
```

### 2. Voucher hết hạn
```json
{
  "success": false,
  "msg": "Voucher đã hết hạn"
}
```

### 3. Voucher hết lượt sử dụng
```json
{
  "success": false,
  "msg": "Voucher đã hết lượt sử dụng"
}
```

## So sánh với hệ thống cũ

### Hệ thống cũ (có thuế)
```
Tổng tiền = Tổng sản phẩm + Thuế + Phí vận chuyển
```

### Hệ thống mới (có voucher)
```
Tổng tiền = Tổng sản phẩm - Voucher discount + Phí vận chuyển
```

## Lưu ý quan trọng

1. **Voucher không bắt buộc**: Có thể thanh toán mà không cần voucher
2. **Tính toán tự động**: Hệ thống tự động trừ discount từ product_total
3. **Validation đầy đủ**: Kiểm tra tất cả điều kiện trước khi áp dụng
4. **Cập nhật usage**: Tự động tăng used_count khi sử dụng voucher
5. **Tương thích ngược**: Vẫn hỗ trợ thanh toán không có voucher

## Migration từ thuế sang voucher

### Frontend cần cập nhật:
1. Thay `tax` bằng `voucher_discount`
2. Cập nhật UI hiển thị voucher thay vì thuế
3. Thêm chức năng chọn voucher
4. Cập nhật tính toán tổng tiền

### Backend đã cập nhật:
1. ✅ Loại bỏ tax trong payment controller
2. ✅ Thêm voucher discount logic
3. ✅ Thêm API tính toán voucher
4. ✅ Cập nhật response format 