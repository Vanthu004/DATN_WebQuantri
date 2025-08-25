# API Gợi Ý Sản phẩm (Product Suggestion API)

## Tổng quan
API này cung cấp các chức năng gợi ý sản phẩm thông minh để cải thiện trải nghiệm tìm kiếm và mua sắm của người dùng.

## Các Endpoint

### 1. Gợi ý sản phẩm (Autocomplete)
**GET** `/api/products/suggest`

Gợi ý sản phẩm dựa trên từ khóa tìm kiếm, phù hợp cho autocomplete.

**Query Parameters:**
- `keyword` (required): Từ khóa tìm kiếm
- `limit` (optional): Số lượng gợi ý tối đa (mặc định: 8)

**Response:**
```json
{
  "success": true,
  "suggestions": [
    {
      "id": "product_id",
      "product_id": "P001",
      "name": "Tên sản phẩm",
      "price": "100,000đ",
      "image_url": "url_ảnh",
      "category": "Tên danh mục"
    }
  ]
}
```

**Ví dụ sử dụng:**
```javascript
// Gợi ý khi user gõ "áo"
fetch('/api/products/suggest?keyword=áo&limit=5')
  .then(response => response.json())
  .then(data => {
    // Hiển thị gợi ý trong dropdown
    displaySuggestions(data.suggestions);
  });
```

### 2. Sản phẩm liên quan
**GET** `/api/products/related`

Lấy sản phẩm liên quan dựa trên sản phẩm hiện tại (cùng category, price range, color, size).

**Query Parameters:**
- `productId` (required): ID sản phẩm hiện tại
- `limit` (optional): Số lượng sản phẩm liên quan (mặc định: 6)

**Response:**
```json
{
  "success": true,
  "relatedProducts": [
    {
      "id": "product_id",
      "product_id": "P002",
      "name": "Tên sản phẩm liên quan",
      "price": "150,000 - 200,000đ",
      "image_url": "url_ảnh",
      "category": "Tên danh mục",
      "sold_quantity": 50,
      "views": 120
    }
  ]
}
```

**Ví dụ sử dụng:**
```javascript
// Lấy sản phẩm liên quan khi xem chi tiết sản phẩm
fetch('/api/products/related?productId=64f1a2b3c4d5e6f7g8h9i0j1&limit=4')
  .then(response => response.json())
  .then(data => {
    // Hiển thị sản phẩm liên quan
    displayRelatedProducts(data.relatedProducts);
  });
```

### 3. Sản phẩm phổ biến (Trending)
**GET** `/api/products/trending`

Lấy sản phẩm phổ biến dựa trên số lượng bán và lượt xem.

**Query Parameters:**
- `limit` (optional): Số lượng sản phẩm (mặc định: 10)
- `timeRange` (optional): Khoảng thời gian - `today`, `week`, `month`, `all` (mặc định: `all`)

**Response:**
```json
{
  "success": true,
  "trendingProducts": [
    {
      "id": "product_id",
      "product_id": "P003",
      "name": "Tên sản phẩm phổ biến",
      "price": "200,000đ",
      "image_url": "url_ảnh",
      "category": "Tên danh mục",
      "sold_quantity": 100,
      "views": 500,
      "popularity_score": 85.5
    }
  ]
}
```

**Ví dụ sử dụng:**
```javascript
// Lấy sản phẩm phổ biến trong tuần
fetch('/api/products/trending?timeRange=week&limit=8')
  .then(response => response.json())
  .then(data => {
    // Hiển thị sản phẩm trending
    displayTrendingProducts(data.trendingProducts);
  });
```

### 4. Gợi ý cá nhân hóa
**GET** `/api/products/personalized`

Lấy gợi ý sản phẩm dựa trên lịch sử người dùng (đang phát triển).

**Query Parameters:**
- `userId` (required): ID người dùng
- `limit` (optional): Số lượng gợi ý (mặc định: 8)

**Response:**
```json
{
  "success": true,
  "message": "Tính năng đang phát triển, hiện tại hiển thị sản phẩm phổ biến",
  "personalizedProducts": [
    {
      "id": "product_id",
      "product_id": "P004",
      "name": "Tên sản phẩm gợi ý",
      "price": "180,000đ",
      "image_url": "url_ảnh",
      "category": "Tên danh mục"
    }
  ]
}
```

### 5. Tìm kiếm nâng cao với gợi ý
**GET** `/api/products/search/enhanced`

Tìm kiếm sản phẩm với nhiều filter và trả về gợi ý liên quan.

**Query Parameters:**
- `keyword` (required): Từ khóa tìm kiếm
- `page` (optional): Trang hiện tại (mặc định: 1)
- `limit` (optional): Số lượng sản phẩm mỗi trang (mặc định: 10)
- `category` (optional): ID danh mục
- `priceMin` (optional): Giá tối thiểu
- `priceMax` (optional): Giá tối đa
- `sortBy` (optional): Sắp xếp - `relevance`, `price_low`, `price_high`, `popularity`, `newest` (mặc định: `relevance`)

**Response:**
```json
{
  "success": true,
  "total": 25,
  "page": 1,
  "limit": 10,
  "products": [
    {
      "id": "product_id",
      "product_id": "P005",
      "name": "Tên sản phẩm tìm được",
      "description": "Mô tả sản phẩm",
      "price": "120,000đ",
      "image_url": "url_ảnh",
      "category": "Tên danh mục",
      "available_colors": ["Đỏ", "Xanh"],
      "available_sizes": ["S", "M", "L"],
      "sold_quantity": 30,
      "views": 150
    }
  ],
  "suggestions": [
    {
      "id": "product_id",
      "product_id": "P006",
      "name": "Sản phẩm gợi ý liên quan",
      "price": "140,000đ",
      "image_url": "url_ảnh",
      "category": "Tên danh mục"
    }
  ]
}
```

## Cách sử dụng trong Frontend

### 1. Autocomplete Search
```javascript
class ProductSearch {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.suggestionsContainer = document.getElementById('suggestions');
    this.debounceTimer = null;
    
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });
  }

  handleSearchInput(keyword) {
    clearTimeout(this.debounceTimer);
    
    if (keyword.length < 2) {
      this.hideSuggestions();
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.fetchSuggestions(keyword);
    }, 300);
  }

  async fetchSuggestions(keyword) {
    try {
      const response = await fetch(`/api/products/suggest?keyword=${encodeURIComponent(keyword)}&limit=8`);
      const data = await response.json();
      
      if (data.success) {
        this.displaySuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }

  displaySuggestions(suggestions) {
    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }

    this.suggestionsContainer.innerHTML = suggestions.map(product => `
      <div class="suggestion-item" onclick="selectProduct('${product.id}')">
        <img src="${product.image_url}" alt="${product.name}" class="suggestion-image">
        <div class="suggestion-info">
          <div class="suggestion-name">${product.name}</div>
          <div class="suggestion-price">${product.price}</div>
          <div class="suggestion-category">${product.category}</div>
        </div>
      </div>
    `).join('');

    this.suggestionsContainer.style.display = 'block';
  }

  hideSuggestions() {
    this.suggestionsContainer.style.display = 'none';
  }
}

// Khởi tạo
new ProductSearch();
```

### 2. Related Products
```javascript
class RelatedProducts {
  constructor(productId) {
    this.productId = productId;
    this.container = document.getElementById('related-products');
    this.loadRelatedProducts();
  }

  async loadRelatedProducts() {
    try {
      const response = await fetch(`/api/products/related?productId=${this.productId}&limit=4`);
      const data = await response.json();
      
      if (data.success) {
        this.displayRelatedProducts(data.relatedProducts);
      }
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  }

  displayRelatedProducts(products) {
    this.container.innerHTML = `
      <h3>Sản phẩm liên quan</h3>
      <div class="related-products-grid">
        ${products.map(product => `
          <div class="product-card" onclick="goToProduct('${product.id}')">
            <img src="${product.image_url}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p class="price">${product.price}</p>
            <p class="category">${product.category}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
}
```

### 3. Trending Products
```javascript
class TrendingProducts {
  constructor() {
    this.container = document.getElementById('trending-products');
    this.loadTrendingProducts();
  }

  async loadTrendingProducts() {
    try {
      const response = await fetch('/api/products/trending?limit=8&timeRange=week');
      const data = await response.json();
      
      if (data.success) {
        this.displayTrendingProducts(data.trendingProducts);
      }
    } catch (error) {
      console.error('Error loading trending products:', error);
    }
  }

  displayTrendingProducts(products) {
    this.container.innerHTML = `
      <h2>Sản phẩm phổ biến tuần này</h2>
      <div class="trending-grid">
        ${products.map(product => `
          <div class="trending-card" onclick="goToProduct('${product.id}')">
            <div class="trending-badge">🔥 Trending</div>
            <img src="${product.image_url}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${product.price}</p>
            <div class="trending-stats">
              <span>Đã bán: ${product.sold_quantity}</span>
              <span>Lượt xem: ${product.views}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}
```

## CSS Styling

### Suggestions Dropdown
```css
.suggestions-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.suggestion-info {
  flex: 1;
}

.suggestion-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.suggestion-price {
  color: #e74c3c;
  font-weight: 600;
  margin-bottom: 2px;
}

.suggestion-category {
  color: #666;
  font-size: 12px;
}
```

### Related Products Grid
```css
.related-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.product-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 12px;
}

.product-card h4 {
  margin: 8px 0;
  font-size: 14px;
  color: #333;
}

.product-card .price {
  color: #e74c3c;
  font-weight: 600;
  margin: 8px 0;
}

.product-card .category {
  color: #666;
  font-size: 12px;
}
```

## Lưu ý quan trọng

1. **Performance**: Sử dụng debounce cho search input để tránh gọi API quá nhiều
2. **Error Handling**: Luôn xử lý lỗi khi gọi API
3. **Loading States**: Hiển thị loading indicator khi đang tải dữ liệu
4. **Caching**: Có thể cache kết quả trending products để tăng performance
5. **Mobile Responsive**: Đảm bảo UI hoạt động tốt trên mobile

## Tương lai

- [ ] Implement lịch sử tìm kiếm người dùng
- [ ] Machine learning để gợi ý chính xác hơn
- [ ] A/B testing cho các thuật toán gợi ý
- [ ] Real-time trending products
- [ ] Personalized recommendations dựa trên behavior
