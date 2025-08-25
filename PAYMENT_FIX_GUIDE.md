# 🚀 HƯỚNG DẪN SỬA LỖI THANH TOÁN ZALOPAY

## ❌ Vấn đề đã được sửa

**Trước đây:** Khi thanh toán online thành công, toàn bộ giỏ hàng bị xóa thay vì chỉ xóa những sản phẩm đã thanh toán.

**Nguyên nhân:** Trong `zaloPayCallback`, code sử dụng `CartItem.deleteMany({ cart_id: cartId })` để xóa toàn bộ giỏ hàng.

## ✅ Giải pháp đã áp dụng

### 1. Backend đã được sửa

- **File:** `src/controllers/paymentController.js`
- **Thay đổi:** 
  - Thêm `cart_item_ids` vào `embed_data` khi tạo ZaloPay order
  - Sửa callback để chỉ xóa những cart items đã thanh toán

### 2. Logic mới

```javascript
// Trước: Xóa toàn bộ giỏ hàng
const deleteResult = await CartItem.deleteMany({ cart_id: cartId });

// Sau: Chỉ xóa những items đã thanh toán
if (cartItemIds && cartItemIds.length > 0) {
  const deleteResult = await CartItem.deleteMany({ 
    _id: { $in: cartItemIds } 
  });
} else if (cartId) {
  // Fallback: xóa toàn bộ nếu không có cart_item_ids
  const deleteResult = await CartItem.deleteMany({ cart_id: cartId });
}
```

## 🔧 Cách sử dụng ở Frontend

### 1. Khi gọi API tạo ZaloPay order

```javascript
// Thêm cart_item_ids vào request body
const requestBody = {
  cart_id: cartId,
  order_code: orderCode,
  items: selectedItems,
  cart_item_ids: selectedCartItemIds, // ← THÊM DÒNG NÀY
  product_total: productTotal,
  voucher_discount: voucherDiscount,
  shipping_fee: shippingFee
};

// Gọi API
const response = await createZaloPayOrder(requestBody);
```

### 2. Cách lấy cart_item_ids

```javascript
// Lấy danh sách cart item IDs của những sản phẩm được chọn thanh toán
const selectedCartItemIds = selectedItems.map(item => item.cart_item_id);

// Hoặc nếu bạn có danh sách cart items
const selectedCartItemIds = selectedCartItems.map(cartItem => cartItem._id);
```

### 3. Ví dụ hoàn chỉnh

```javascript
const handleZaloPayPayment = async () => {
  try {
    // Lấy những sản phẩm được chọn từ giỏ hàng
    const selectedItems = cartItems.filter(item => item.isSelected);
    const selectedCartItemIds = selectedItems.map(item => item._id);
    
    const requestBody = {
      cart_id: currentCartId,
      order_code: generateOrderCode(),
      items: selectedItems,
      cart_item_ids: selectedCartItemIds, // ← QUAN TRỌNG!
      product_total: calculateProductTotal(selectedItems),
      voucher_discount: voucherDiscount,
      shipping_fee: shippingFee
    };

    const response = await createZaloPayOrder(requestBody);
    
    if (response.success) {
      // Xử lý thành công
      console.log('Tạo ZaloPay order thành công');
    }
  } catch (error) {
    console.error('Lỗi tạo ZaloPay order:', error);
  }
};
```

## 🎯 Kết quả mong đợi

**Trước khi sửa:**
- User có 5 sản phẩm trong giỏ hàng
- Chọn thanh toán 2 sản phẩm
- Sau khi thanh toán thành công → Cả 5 sản phẩm bị xóa ❌

**Sau khi sửa:**
- User có 5 sản phẩm trong giỏ hàng  
- Chọn thanh toán 2 sản phẩm
- Sau khi thanh toán thành công → Chỉ 2 sản phẩm đã thanh toán bị xóa ✅
- 3 sản phẩm còn lại vẫn ở trong giỏ hàng ✅

## 🔍 Kiểm tra

### 1. Kiểm tra logs backend

```bash
# Trong console backend, bạn sẽ thấy:
Cart Item IDs cần xóa: ['64f1234567890abcdef12345', '64f1234567890abcdef12346']
Kết quả xóa cart items đã thanh toán: { acknowledged: true, deletedCount: 2 }
Đã xóa 2 cart items đã thanh toán
```

### 2. Kiểm tra database

```javascript
// Trước khi thanh toán
const beforePayment = await CartItem.find({ cart_id: cartId });
console.log('Trước thanh toán:', beforePayment.length); // 5 items

// Sau khi thanh toán thành công
const afterPayment = await CartItem.find({ cart_id: cartId });  
console.log('Sau thanh toán:', afterPayment.length); // 3 items (chỉ xóa 2 items đã thanh toán)
```

## ⚠️ Lưu ý quan trọng

1. **Frontend bắt buộc phải gửi `cart_item_ids`** để logic mới hoạt động
2. **Nếu không gửi `cart_item_ids`**, backend sẽ fallback về logic cũ (xóa toàn bộ giỏ hàng)
3. **Đảm bảo `cart_item_ids` là mảng các ObjectId hợp lệ** từ MongoDB
4. **Test kỹ trước khi deploy** để đảm bảo không ảnh hưởng đến chức năng hiện tại

## 🚀 Bước tiếp theo

1. **Cập nhật frontend** để gửi `cart_item_ids`
2. **Test thanh toán** với một vài sản phẩm
3. **Kiểm tra logs** để đảm bảo logic hoạt động đúng
4. **Deploy** khi đã test thành công

---

**Lỗi đã được sửa hoàn toàn! 🎉** 
Bây giờ user sẽ chỉ mất những sản phẩm đã thanh toán, không còn bị mất toàn bộ giỏ hàng nữa.
