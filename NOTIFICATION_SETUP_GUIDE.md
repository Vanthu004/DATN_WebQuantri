# Hướng dẫn cấu hình Push Notification cho Expo Development

## 🔧 Cài đặt Dependencies

```bash
npm install firebase-admin expo-server-sdk
```

## 📝 Cấu hình Environment Variables

Thêm vào file `.env`:

```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./noti-datn-firebase-adminsdk-fbsvc-4efcd9148f.json
FIREBASE_PROJECT_ID=noti-datn

# Expo Configuration (optional)
EXPO_ACCESS_TOKEN=your_expo_access_token_here
```

## 🚀 API Endpoints

### 1. Lưu Token
```http
POST /api/notifications/save-token
Content-Type: application/json

{
  "id": "user_id_here",
  "token_device": "expo_push_token_or_fcm_token",
  "token_type": "expo" // hoặc "fcm"
}
```

### 2. Gửi thông báo đơn lẻ
```http
POST /api/notifications/send-notification
Content-Type: application/json

{
  "id": "user_id_here",
  "title": "Tiêu đề thông báo",
  "body": "Nội dung thông báo",
  "data": {
    "customKey": "customValue"
  }
}
```

### 3. Gửi thông báo hàng loạt
```http
POST /api/notifications/send-bulk-notification
Content-Type: application/json

{
  "userIds": ["user_id_1", "user_id_2"],
  "title": "Tiêu đề thông báo",
  "body": "Nội dung thông báo",
  "data": {
    "customKey": "customValue"
  }
}
```

## 📱 Cấu hình Client (React Native/Expo)

### 1. Cài đặt Expo Notifications
```bash
expo install expo-notifications
```

### 2. Cấu hình trong app.json
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

### 3. Code để lấy và gửi token
```javascript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Cấu hình notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Hàm đăng ký push notification
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id',
    })).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

// Hàm gửi token lên server
export async function saveTokenToServer(userId, token) {
  try {
    const response = await fetch('YOUR_API_URL/api/notifications/save-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: userId,
        token_device: token,
        token_type: 'expo'
      }),
    });
    
    const result = await response.json();
    console.log('Token saved:', result);
  } catch (error) {
    console.error('Error saving token:', error);
  }
}
```

## 🔍 Kiểm tra và Debug

### 1. Kiểm tra token format
- **Expo tokens**: Bắt đầu với `ExponentPushToken[...]`
- **FCM tokens**: Chuỗi dài không có pattern cụ thể

### 2. Test notification
```bash
# Test với Expo CLI
expo push:android:send --to "ExponentPushToken[...]" --title "Test" --body "Test message"

# Test với Firebase CLI
firebase messaging:send --token "FCM_TOKEN" --message '{"notification":{"title":"Test","body":"Test message"}}'
```

### 3. Logs để debug
- Kiểm tra console logs của server
- Kiểm tra Expo push notification logs
- Kiểm tra Firebase console

## ⚠️ Lưu ý quan trọng

1. **Expo Development**: Sử dụng Expo push tokens
2. **Production**: Có thể sử dụng FCM tokens cho performance tốt hơn
3. **Token Management**: Tự động xóa tokens không hợp lệ
4. **Error Handling**: Xử lý các trường hợp token expired/invalid
5. **Rate Limiting**: Expo có giới hạn 100 requests/second

## 🐛 Troubleshooting

### Lỗi thường gặp:
1. **Token không hợp lệ**: Kiểm tra format và project ID
2. **Permission denied**: Đảm bảo đã cấp quyền notification
3. **Network error**: Kiểm tra kết nối internet
4. **Server error**: Kiểm tra Firebase service account

### Debug steps:
1. Kiểm tra token format
2. Test với Expo CLI
3. Kiểm tra server logs
4. Verify Firebase configuration
