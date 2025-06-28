# API Documentation - Product Home Features

## 🔥 Bán chạy nhất (Best Sellers)

### GET /api/products/best-sellers
Lấy danh sách sản phẩm bán chạy nhất dựa trên `sold_quantity`.

**Query Parameters:**
- `limit` (optional): Số lượng sản phẩm trả về (mặc định: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Tên sản phẩm",
      "price": 100000,
      "image_url": "https://example.com/image.jpg",
      "sold_quantity": 150,
      "category_id": {
        "_id": "category_id",
        "name": "Tên danh mục"
      }
    }
  ],
  "message": "Lấy danh sách sản phẩm bán chạy thành công"
}
```

---

## 🆕 Mới nhất (Newest Products)

### GET /api/products/newest
Lấy danh sách sản phẩm mới nhất dựa trên `created_date`.

**Query Parameters:**
- `limit` (optional): Số lượng sản phẩm trả về (mặc định: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Tên sản phẩm",
      "price": 100000,
      "image_url": "https://example.com/image.jpg",
      "created_date": "2024-01-15T10:30:00.000Z",
      "category_id": {
        "_id": "category_id",
        "name": "Tên danh mục"
      }
    }
  ],
  "message": "Lấy danh sách sản phẩm mới nhất thành công"
}
```

---

## ⭐ Phổ biến nhất (Most Popular)

### GET /api/products/popular
Lấy danh sách sản phẩm phổ biến nhất dựa trên thuật toán tính điểm phổ biến.

**Thuật toán tính điểm:**
- `popularity_score = (sold_quantity × 3) + (views × 1)`

**Query Parameters:**
- `limit` (optional): Số lượng sản phẩm trả về (mặc định: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Tên sản phẩm",
      "price": 100000,
      "image_url": "https://example.com/image.jpg",
      "sold_quantity": 150,
      "views": 500,
      "popularity_score": 950,
      "category_id": "category_id",
      "category_name": "Tên danh mục"
    }
  ],
  "message": "Lấy danh sách sản phẩm phổ biến thành công"
}
```

---

## 🏠 Dữ liệu tổng hợp cho màn hình Home

### GET /api/home
Lấy tất cả dữ liệu cần thiết cho màn hình home trong một lần gọi API.

**Query Parameters:**
- `limit` (optional): Số lượng sản phẩm mỗi danh mục (mặc định: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "bestSellers": {
      "title": "🔥 Bán chạy nhất",
      "products": [...]
    },
    "newestProducts": {
      "title": "🆕 Mới nhất",
      "products": [...]
    },
    "popularProducts": {
      "title": "⭐ Phổ biến nhất",
      "products": [...]
    }
  },
  "message": "Lấy dữ liệu màn hình home thành công"
}
```

---

## 📈 Tăng lượt xem sản phẩm

### POST /api/products/:id/increment-views
Tăng lượt xem của sản phẩm khi người dùng xem chi tiết sản phẩm.

**Path Parameters:**
- `id`: ID của sản phẩm

**Response:**
```json
{
  "success": true,
  "data": {
    "views": 501
  },
  "message": "Đã tăng lượt xem sản phẩm"
}
```

---

## 📱 Sử dụng trong Expo/React Native

### Ví dụ gọi API trong Expo:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://your-server.com';

// Lấy dữ liệu tổng hợp cho màn hình home
const getHomeData = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/home?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching home data:', error);
    throw error;
  }
};

// Lấy sản phẩm bán chạy
const getBestSellers = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products/best-sellers?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    throw error;
  }
};

// Lấy sản phẩm mới nhất
const getNewestProducts = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products/newest?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching newest products:', error);
    throw error;
  }
};

// Lấy sản phẩm phổ biến
const getPopularProducts = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products/popular?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular products:', error);
    throw error;
  }
};

// Tăng lượt xem sản phẩm
const incrementProductViews = async (productId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/products/${productId}/increment-views`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing product views:', error);
    throw error;
  }
};
```

### Ví dụ sử dụng trong component React Native:

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { getHomeData } from '../services/api';

const HomeScreen = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const data = await getHomeData(10);
      setHomeData(data.data);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.productItem}>
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price.toLocaleString()} VNĐ</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <Text>Đang tải...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Bán chạy nhất */}
      <Text style={styles.sectionTitle}>{homeData.bestSellers.title}</Text>
      <FlatList
        data={homeData.bestSellers.products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      {/* Mới nhất */}
      <Text style={styles.sectionTitle}>{homeData.newestProducts.title}</Text>
      <FlatList
        data={homeData.newestProducts.products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      {/* Phổ biến nhất */}
      <Text style={styles.sectionTitle}>{homeData.popularProducts.title}</Text>
      <FlatList
        data={homeData.popularProducts.products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default HomeScreen;
```

---

## 🔧 Cấu hình và Lưu ý

1. **Trường `views`**: Đã được thêm vào model Product để tính toán độ phổ biến
2. **Thuật toán phổ biến**: Có thể điều chỉnh trọng số trong controller `getPopularProducts`
3. **Performance**: API `/api/home` tối ưu bằng cách gọi song song các query
4. **Error Handling**: Tất cả API đều có xử lý lỗi và response format thống nhất
5. **Pagination**: Có thể mở rộng thêm pagination cho các danh sách dài 