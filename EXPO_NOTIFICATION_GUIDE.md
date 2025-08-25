# Hướng dẫn đón dữ liệu thông báo trong Expo

## 1. Cài đặt dependencies

```bash
npx expo install expo-notifications
npx expo install expo-device
npx expo install expo-constants
```

## 2. Cấu hình trong app.json

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.yourapp",
      "googleServicesFile": "./google-services.json"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
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

## 3. Tạo NotificationService

Tạo file `services/NotificationService.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Cấu hình cách hiển thị thông báo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Đăng ký nhận thông báo
  async registerForPushNotificationsAsync(): Promise<string | null> {
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
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      // Lấy Expo Push Token
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      this.expoPushToken = token;
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Lấy token hiện tại
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Gửi token lên server
  async sendTokenToServer(userId: string, token: string): Promise<void> {
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

      if (!response.ok) {
        throw new Error('Failed to send token to server');
      }

      console.log('Token sent to server successfully');
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  // Thiết lập listener cho thông báo
  setupNotificationListeners(): void {
    // Listener khi nhận thông báo khi app đang mở
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener khi user tap vào thông báo
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  // Xử lý khi nhận thông báo
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { title, body, data } = notification.request.content;
    
    console.log('Received notification:');
    console.log('Title:', title);
    console.log('Body:', body);
    console.log('Data:', data);

    // Xử lý dữ liệu tùy chỉnh
    if (data) {
      this.processCustomData(data);
    }
  }

  // Xử lý khi user tap vào thông báo
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { title, body, data } = response.notification.request.content;
    
    console.log('User tapped notification:');
    console.log('Title:', title);
    console.log('Body:', body);
    console.log('Data:', data);

    // Điều hướng dựa trên dữ liệu
    if (data) {
      this.navigateBasedOnData(data);
    }
  }

  // Xử lý dữ liệu tùy chỉnh
  private processCustomData(data: any): void {
    // Xử lý các loại dữ liệu khác nhau
    switch (data.type) {
      case 'order_update':
        this.handleOrderUpdate(data);
        break;
      case 'promotion':
        this.handlePromotion(data);
        break;
      case 'chat_message':
        this.handleChatMessage(data);
        break;
      default:
        console.log('Unknown notification type:', data.type);
    }
  }

  // Xử lý cập nhật đơn hàng
  private handleOrderUpdate(data: any): void {
    console.log('Order update received:', data);
    // Cập nhật state đơn hàng
    // Hiển thị toast thông báo
    // Refresh danh sách đơn hàng
  }

  // Xử lý khuyến mãi
  private handlePromotion(data: any): void {
    console.log('Promotion received:', data);
    // Hiển thị modal khuyến mãi
    // Cập nhật danh sách voucher
  }

  // Xử lý tin nhắn chat
  private handleChatMessage(data: any): void {
    console.log('Chat message received:', data);
    // Cập nhật số tin nhắn chưa đọc
    // Hiển thị badge trên icon chat
  }

  // Điều hướng dựa trên dữ liệu
  private navigateBasedOnData(data: any): void {
    // Sử dụng navigation để điều hướng
    // Ví dụ: navigation.navigate('OrderDetail', { orderId: data.orderId });
  }
}

export default NotificationService.getInstance();
```

## 4. Sử dụng trong App.tsx

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import NotificationService from './services/NotificationService';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Đăng ký nhận thông báo
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      
      // Gửi token lên server (thay thế userId bằng ID thực tế)
      if (token) {
        NotificationService.sendTokenToServer('user_id_here', token);
      }
    });

    // Thiết lập listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      NotificationService.handleNotificationReceived(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
      NotificationService.handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NavigationContainer>
      {/* Your app components */}
    </NavigationContainer>
  );
}

async function registerForPushNotificationsAsync() {
  return await NotificationService.registerForPushNotificationsAsync();
}
```

## 5. Sử dụng trong Component

```typescript
import React, { useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import NotificationService from '../services/NotificationService';

export default function HomeScreen() {
  useEffect(() => {
    // Thiết lập listeners khi component mount
    const cleanup = NotificationService.setupNotificationListeners();

    return cleanup;
  }, []);

  const handleSendTestNotification = async () => {
    // Gửi thông báo test
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification",
        data: { type: 'test', customData: 'value' },
      },
      trigger: null, // Gửi ngay lập tức
    });
  };

  return (
    <View>
      <Text>Home Screen</Text>
      <Button title="Send Test Notification" onPress={handleSendTestNotification} />
    </View>
  );
}
```

## 6. Xử lý các loại thông báo khác nhau

### Thông báo đơn hàng
```typescript
// Khi nhận thông báo đơn hàng
const handleOrderNotification = (data: any) => {
  if (data.type === 'order_update') {
    // Cập nhật trạng thái đơn hàng
    updateOrderStatus(data.orderId, data.status);
    
    // Hiển thị toast
    showToast(`Đơn hàng ${data.orderCode} đã được ${data.status}`);
    
    // Refresh danh sách đơn hàng
    refreshOrders();
  }
};
```

### Thông báo khuyến mãi
```typescript
// Khi nhận thông báo khuyến mãi
const handlePromotionNotification = (data: any) => {
  if (data.type === 'promotion') {
    // Hiển thị modal khuyến mãi
    showPromotionModal({
      title: data.title,
      description: data.description,
      discount: data.discount,
      validUntil: data.validUntil
    });
    
    // Cập nhật danh sách voucher
    refreshVouchers();
  }
};
```

### Thông báo chat
```typescript
// Khi nhận thông báo chat
const handleChatNotification = (data: any) => {
  if (data.type === 'chat_message') {
    // Cập nhật số tin nhắn chưa đọc
    updateUnreadMessageCount(data.roomId, data.count);
    
    // Hiển thị badge trên icon chat
    updateChatBadge(data.count);
    
    // Phát âm thanh thông báo
    playNotificationSound();
  }
};
```

## 7. Testing

### Test với Expo Push Tool
```bash
# Cài đặt expo-cli
npm install -g @expo/cli

# Gửi thông báo test
expo push:android:send --to "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]" --title "Test" --body "Test message"

# Hoặc sử dụng curl
curl -H "Content-Type: application/json" -X POST "https://exp.host/--/api/v2/push/send" -d '{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title":"Test",
  "body": "Test message",
  "data": { "type": "test" }
}'
```

### Test với server
```javascript
// Test API từ server
const testNotification = async () => {
  const response = await fetch('YOUR_API_URL/api/notifications/send-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: 'user_id_here',
      title: 'Test Notification',
      body: 'This is a test notification from server',
      data: {
        type: 'test',
        customData: 'test value'
      }
    }),
  });
  
  console.log('Test notification sent:', response.status);
};
```

## 8. Troubleshooting

### Lỗi thường gặp:

1. **Token không được gửi lên server**
   - Kiểm tra kết nối internet
   - Kiểm tra URL API
   - Kiểm tra format dữ liệu gửi

2. **Thông báo không hiển thị**
   - Kiểm tra quyền thông báo
   - Kiểm tra cấu hình notification handler
   - Kiểm tra device token

3. **App crash khi nhận thông báo**
   - Kiểm tra xử lý dữ liệu trong listeners
   - Kiểm tra navigation logic
   - Kiểm tra state updates

### Debug tips:
```typescript
// Thêm logging để debug
console.log('Expo Push Token:', expoPushToken);
console.log('Notification received:', notification);
console.log('Notification data:', notification?.request?.content?.data);
```

## 9. Best Practices

1. **Luôn kiểm tra quyền thông báo trước khi gửi token**
2. **Xử lý lỗi khi gửi token lên server**
3. **Sử dụng try-catch trong notification handlers**
4. **Không block UI thread khi xử lý thông báo**
5. **Lưu trữ token locally để tránh gửi lại**
6. **Cập nhật token khi app restart**
7. **Xử lý các trường hợp app đang mở/đóng**
8. **Test trên device thật, không phải simulator**
