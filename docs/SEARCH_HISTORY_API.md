# API Lịch sử Tìm kiếm (Search History API)

## Tổng quan
API này cung cấp các chức năng quản lý lịch sử tìm kiếm của người dùng, bao gồm:
- Lưu trữ lịch sử tìm kiếm
- Lấy từ khóa phổ biến
- Gợi ý tìm kiếm dựa trên lịch sử
- Thống kê tìm kiếm

## Các Endpoint

### 1. Lấy từ khóa tìm kiếm phổ biến
**GET** `/api/search-history/popular`

Lấy danh sách từ khóa tìm kiếm phổ biến nhất.

**Query Parameters:**
- `limit` (optional): Số lượng từ khóa (mặc định: 10)
- `timeRange` (optional): Khoảng thời gian - `today`, `week`, `month`, `all` (mặc định: `all`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "keyword": "áo thun",
      "total_searches": 150,
      "unique_user_count": 45,
      "last_searched": "2024-01-15T10:30:00.000Z",
      "search_type": "product",
      "popularity_score": 127.5
    }
  ],
  "message": "Lấy danh sách từ khóa phổ biến thành công (all)"
}
```

### 2. Lấy từ khóa phổ biến thời gian thực
**GET** `/api/search-history/realtime-popular`

Lấy từ khóa phổ biến trong khoảng thời gian gần đây.

**Query Parameters:**
- `limit` (optional): Số lượng từ khóa (mặc định: 10)
- `hours` (optional): Số giờ gần đây (mặc định: 24)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "keyword": "quần jean",
      "searches": 25,
      "unique_user_count": 12,
      "last_searched": "2024-01-15T14:20:00.000Z",
      "trending_score": 19.8
    }
  ],
  "message": "Lấy từ khóa phổ biến trong 24 giờ gần đây thành công"
}
```

### 3. Lấy lịch sử tìm kiếm của user
**GET** `/api/search-history/history`

Lấy lịch sử tìm kiếm của người dùng cụ thể.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Số lượng lịch sử (mặc định: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "keyword": "giày sneaker",
      "search_count": 3,
      "last_searched_at": "2024-01-15T12:30:00.000Z",
      "search_type": "product",
      "result_count": 15
    }
  ],
  "message": "Lấy lịch sử tìm kiếm thành công"
}
```

### 4. Lấy lịch sử tìm kiếm gần đây
**GET** `/api/search-history/recent`

Lấy lịch sử tìm kiếm gần đây nhất của user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Số lượng lịch sử (mặc định: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "keyword": "túi xách",
      "last_searched_at": "2024-01-15T15:45:00.000Z",
      "search_type": "product",
      "result_count": 8
    }
  ],
  "message": "Lấy lịch sử tìm kiếm gần đây thành công"
}
```

### 5. Lấy gợi ý tìm kiếm
**GET** `/api/search-history/suggestions`

Lấy gợi ý tìm kiếm dựa trên lịch sử và từ khóa phổ biến.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `keyword` (required): Từ khóa để tìm gợi ý
- `limit` (optional): Số lượng gợi ý (mặc định: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "keyword": "áo thun nam",
      "total_searches": 5,
      "source": "history"
    },
    {
      "keyword": "áo thun nữ",
      "total_searches": 120,
      "source": "popular"
    }
  ],
  "message": "Lấy gợi ý tìm kiếm thành công"
}
```

### 6. Thêm lịch sử tìm kiếm
**POST** `/api/search-history/add`

Thêm hoặc cập nhật lịch sử tìm kiếm.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "keyword": "áo khoác",
  "searchType": "product",
  "resultCount": 25
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "keyword": "áo khoác",
    "search_count": 2,
    "last_searched_at": "2024-01-15T16:00:00.000Z",
    "search_type": "product",
    "result_count": 25
  },
  "message": "Đã lưu lịch sử tìm kiếm"
}
```

### 7. Xóa lịch sử tìm kiếm
**DELETE** `/api/search-history/delete`

Xóa lịch sử tìm kiếm của user.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "keyword": "áo khoác"  // Nếu không có keyword thì xóa tất cả
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 1
  },
  "message": "Đã xóa lịch sử tìm kiếm \"áo khoác\""
}
```

### 8. Lấy thống kê tìm kiếm
**GET** `/api/search-history/stats`

Lấy thống kê tổng quan về tìm kiếm.

**Query Parameters:**
- `timeRange` (optional): Khoảng thời gian (mặc định: `all`)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_searches": 1250,
      "unique_keywords_count": 89,
      "unique_users_count": 156
    },
    "top_keywords": [
      {
        "keyword": "áo thun",
        "total_searches": 150,
        "unique_user_count": 45,
        "popularity_score": 127.5
      }
    ],
    "search_types": [
      {
        "search_type": "product",
        "count": 1200,
        "total_searches": 1200
      }
    ],
    "daily_stats": [
      {
        "date": "2024-01-15",
        "searches": 45,
        "unique_users_count": 23
      }
    ]
  },
  "message": "Lấy thống kê tìm kiếm thành công"
}
```

## Tích hợp với Product API

### Cập nhật Product Suggest API
API `suggestProducts` đã được cập nhật để tự động lưu lịch sử tìm kiếm:

```javascript
// Gọi API suggest với user đã đăng nhập
fetch('/api/products/suggest?keyword=áo&limit=5', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(response => response.json())
.then(data => {
  // Kết quả gợi ý sản phẩm
  console.log(data.suggestions);
  // Lịch sử tìm kiếm đã được tự động lưu
});
```

### Enhanced Search API
API `enhancedSearchProducts` cũng đã được tích hợp:

```javascript
// Tìm kiếm nâng cao với lưu lịch sử
fetch('/api/products/search/enhanced?keyword=quần&limit=10&sortBy=popularity', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(response => response.json())
.then(data => {
  console.log(data.products); // Kết quả tìm kiếm
  console.log(data.suggestions); // Gợi ý liên quan
  // Lịch sử đã được lưu tự động
});
```

## Cách sử dụng trong Frontend

### 1. Hiển thị từ khóa phổ biến
```javascript
class PopularKeywords {
  constructor() {
    this.container = document.getElementById('popular-keywords');
    this.loadPopularKeywords();
  }

  async loadPopularKeywords() {
    try {
      const response = await fetch('/api/search-history/popular?limit=8&timeRange=week');
      const data = await response.json();
      
      if (data.success) {
        this.displayPopularKeywords(data.data);
      }
    } catch (error) {
      console.error('Error loading popular keywords:', error);
    }
  }

  displayPopularKeywords(keywords) {
    this.container.innerHTML = `
      <h3>🔥 Từ khóa phổ biến tuần này</h3>
      <div class="popular-keywords-grid">
        ${keywords.map(item => `
          <div class="keyword-tag" onclick="searchKeyword('${item.keyword}')">
            <span class="keyword-text">${item.keyword}</span>
            <span class="search-count">${item.total_searches} lượt tìm</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}
```

### 2. Hiển thị lịch sử tìm kiếm
```javascript
class SearchHistory {
  constructor() {
    this.container = document.getElementById('search-history');
    this.loadSearchHistory();
  }

  async loadSearchHistory() {
    try {
      const response = await fetch('/api/search-history/recent?limit=5', {
        headers: {
          'Authorization': 'Bearer ' + getToken()
        }
      });
      const data = await response.json();
      
      if (data.success) {
        this.displaySearchHistory(data.data);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }

  displaySearchHistory(history) {
    if (history.length === 0) {
      this.container.innerHTML = '<p>Chưa có lịch sử tìm kiếm</p>';
      return;
    }

    this.container.innerHTML = `
      <h3>🔍 Tìm kiếm gần đây</h3>
      <div class="search-history-list">
        ${history.map(item => `
          <div class="history-item">
            <div class="history-keyword" onclick="searchKeyword('${item.keyword}')">
              <span class="keyword">${item.keyword}</span>
              <span class="time">${this.formatTime(item.last_searched_at)}</span>
            </div>
            <button class="delete-btn" onclick="deleteSearchHistory('${item.keyword}')">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  }
}
```

### 3. Gợi ý tìm kiếm thông minh
```javascript
class SmartSearchSuggestions {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.suggestionsContainer = document.getElementById('smart-suggestions');
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
      this.fetchSmartSuggestions(keyword);
    }, 300);
  }

  async fetchSmartSuggestions(keyword) {
    try {
      const response = await fetch(`/api/search-history/suggestions?keyword=${encodeURIComponent(keyword)}&limit=5`, {
        headers: {
          'Authorization': 'Bearer ' + getToken()
        }
      });
      const data = await response.json();
      
      if (data.success) {
        this.displaySmartSuggestions(data.data, keyword);
      }
    } catch (error) {
      console.error('Error fetching smart suggestions:', error);
    }
  }

  displaySmartSuggestions(suggestions, currentKeyword) {
    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }

    this.suggestionsContainer.innerHTML = `
      <div class="smart-suggestions">
        ${suggestions.map(item => `
          <div class="suggestion-item ${item.source}" onclick="selectSuggestion('${item.keyword}')">
            <div class="suggestion-icon">
              ${item.source === 'history' ? '🕒' : '🔥'}
            </div>
            <div class="suggestion-content">
              <div class="suggestion-keyword">${this.highlightKeyword(item.keyword, currentKeyword)}</div>
              <div class="suggestion-meta">
                ${item.source === 'history' ? 'Tìm kiếm gần đây' : `${item.total_searches} lượt tìm`}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.suggestionsContainer.style.display = 'block';
  }

  highlightKeyword(keyword, searchTerm) {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return keyword.replace(regex, '<strong>$1</strong>');
  }

  hideSuggestions() {
    this.suggestionsContainer.style.display = 'none';
  }
}
```

## CSS Styling

### Popular Keywords
```css
.popular-keywords-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.keyword-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.keyword-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.keyword-text {
  font-weight: 600;
  font-size: 14px;
}

.search-count {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
}
```

### Search History
```css
.search-history-list {
  margin-top: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: #f8f9fa;
}

.history-keyword {
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.keyword {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.time {
  font-size: 12px;
  color: #666;
}

.delete-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.delete-btn:hover {
  color: #e74c3c;
}
```

### Smart Suggestions
```css
.smart-suggestions {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-item.history {
  background-color: #f0f8ff;
}

.suggestion-item.popular {
  background-color: #fff8f0;
}

.suggestion-icon {
  margin-right: 12px;
  font-size: 16px;
}

.suggestion-content {
  flex: 1;
}

.suggestion-keyword {
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.suggestion-meta {
  font-size: 12px;
  color: #666;
}
```

## Lưu ý quan trọng

1. **Privacy**: Lịch sử tìm kiếm chỉ được lưu cho user đã đăng nhập
2. **Performance**: Sử dụng index để tối ưu query
3. **Data Retention**: Có thể implement policy xóa dữ liệu cũ
4. **Analytics**: Dữ liệu có thể được sử dụng cho phân tích hành vi người dùng
5. **Security**: Validate và sanitize input để tránh injection

## Tương lai

- [ ] Machine learning để gợi ý chính xác hơn
- [ ] Phân tích sentiment của từ khóa tìm kiếm
- [ ] A/B testing cho thuật toán gợi ý
- [ ] Export/import lịch sử tìm kiếm
- [ ] Real-time trending keywords với WebSocket
