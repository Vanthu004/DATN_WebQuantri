
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
const mongoose = require('mongoose');
const User = require('../models/user');

// Khởi tạo Expo SDK
const expo = new Expo();

// Hàm lưu token (hỗ trợ cả FCM và Expo)
exports.saveToken = async (req, res) => {
  const { id, token_device, token_type = "fcm" } = req.body;

  if (!id || !token_device) {
    return res.status(400).json({ message: 'Thiếu id hoặc token_device' });
  }

  if (!['fcm', 'expo'].includes(token_type)) {
    return res.status(400).json({ message: 'token_type phải là "fcm" hoặc "expo"' });
  }

  try {
    const objectId = new mongoose.Types.ObjectId(id);
    
    // Validate Expo token format
    if (token_type === 'expo' && !Expo.isExpoPushToken(token_device)) {
      return res.status(400).json({ message: 'Expo push token không hợp lệ' });
    }

    const updateData = {
      push_token_type: token_type
    };

    if (token_type === 'fcm') {
      updateData.token_device = token_device;
      updateData.expo_push_token = null;
    } else {
      updateData.expo_push_token = token_device;
      updateData.token_device = null;
    }

    await User.findOneAndUpdate(
      { _id: objectId },
      updateData,
      { upsert: true, new: true }
    );
    
    res.status(200).json({ 
      message: `${token_type.toUpperCase()} token lưu thành công`,
      token_type: token_type
    });
  } catch (error) {
    console.error('Lỗi lưu token:', error);
    res.status(500).json({ message: 'Lỗi lưu token' });
  }
};

// Hàm gửi thông báo (hỗ trợ cả FCM và Expo)
exports.sendNotification = async (req, res) => {
  const { id, title, body, data = {} } = req.body;

  if (!id || !title || !body) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }

  try {
    const objectId = new mongoose.Types.ObjectId(id);
    const user = await User.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    let notificationResult = null;

    // Gửi thông báo dựa trên loại token
    if (user.push_token_type === 'expo' && user.expo_push_token) {
      notificationResult = await sendExpoNotification(user.expo_push_token, title, body, data);
    } else if (user.push_token_type === 'fcm' && user.token_device) {
      notificationResult = await sendFCMNotification(user.token_device, title, body, data);
    } else {
      return res.status(404).json({ message: 'Không tìm thấy token thông báo hợp lệ' });
    }

    res.status(200).json({ 
      message: 'Thông báo gửi thành công',
      result: notificationResult
    });

  } catch (error) {
    console.error('Lỗi gửi thông báo:', error.message, error.stack);
    
    // Xử lý lỗi token không hợp lệ
    if (error.code === 'messaging/registration-token-not-registered' || 
        error.code === 'messaging/invalid-registration-token') {
      await User.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) }, 
        { 
          token_device: null,
          expo_push_token: null,
          push_token_type: "fcm"
        }
      );
      res.status(400).json({ message: 'Token không hợp lệ, đã xóa' });
    } else {
      res.status(500).json({ message: 'Lỗi gửi thông báo: ' + error.message });
    }
  }
};

// Hàm gửi thông báo FCM
async function sendFCMNotification(token, title, body, data = {}) {
  const message = {
    token: token,
    notification: {
      title: title,
      body: body,
    },
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK', // Cho Flutter/React Native
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channel_id: 'default_channel',
        priority: 'high',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
    },
  };

  return await admin.messaging().send(message);
}

// Hàm gửi thông báo Expo
async function sendExpoNotification(token, title, body, data = {}) {
  // Tạo message cho Expo
  const messages = [{
    to: token,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    priority: 'high',
  }];

  // Gửi thông báo
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (let chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Lỗi gửi chunk Expo notification:', error);
      throw error;
    }
  }

  return tickets;
}

// Hàm gửi thông báo cho nhiều user cùng lúc
exports.sendBulkNotification = async (req, res) => {
  const { userIds, title, body, data = {} } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: 'Danh sách userIds không hợp lệ' });
  }

  if (!title || !body) {
    return res.status(400).json({ message: 'Thiếu title hoặc body' });
  }

  try {
    const users = await User.find({ 
      _id: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) },
      $or: [
        { token_device: { $ne: null, $ne: "" } },
        { expo_push_token: { $ne: null, $ne: "" } }
      ]
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user nào có token hợp lệ' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Gửi thông báo cho từng user
    for (const user of users) {
      try {
        if (user.push_token_type === 'expo' && user.expo_push_token) {
          await sendExpoNotification(user.expo_push_token, title, body, data);
        } else if (user.push_token_type === 'fcm' && user.token_device) {
          await sendFCMNotification(user.token_device, title, body, data);
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          userId: user._id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: `Gửi thông báo thành công: ${results.success}, thất bại: ${results.failed}`,
      results: results
    });

  } catch (error) {
    console.error('Lỗi gửi bulk notification:', error);
    res.status(500).json({ message: 'Lỗi gửi bulk notification: ' + error.message });
  }
};


