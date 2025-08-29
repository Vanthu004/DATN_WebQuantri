const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
const mongoose = require('mongoose');
const User = require('../models/user'); // sửa path nếu cần

const expo = new Expo();

exports.saveToken = async (req, res) => {
  try {
    const { userId, expo_push_token, token_device, push_token_type } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
    const update = {};
    if (expo_push_token) update.expo_push_token = expo_push_token;
    if (token_device) update.token_device = token_device;
    if (push_token_type) update.push_token_type = push_token_type;
    await User.findByIdAndUpdate(userId, update, { new: true });
    return res.json({ success: true });
  } catch (err) {
    console.error('saveToken error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

async function sendExpoNotifications(messages) {
  // messages: [{ to, sound, title, body, data }]
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      console.error('Expo send error', err);
    }
  }
  return tickets;
}

exports.sendNotification = async (req, res) => {
  try {
    const { id, title, body, data } = req.body; // id = userId
    if (!id || !title || !body) return res.status(400).json({ success: false, message: 'Missing fields' });

    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const expoTokens = [];
    if (user.push_token_type === 'expo' && user.expo_push_token) expoTokens.push(user.expo_push_token);
    // optional: handle FCM tokens by separate flow

    if (expoTokens.length === 0) return res.status(400).json({ success: false, message: 'No valid Expo token for user' });

    const messages = expoTokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {}
    }));

    const tickets = await sendExpoNotifications(messages);
    return res.json({ success: true, tickets });
  } catch (err) {
    console.error('sendNotification error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.sendBulkNotification = async (req, res) => {
  try {
    const { userIds, title, body, data } = req.body;
    if (!title || !body) return res.status(400).json({ success: false, message: 'Missing title/body' });

    let users;
    if (Array.isArray(userIds) && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } }).lean();
    } else {
      // nếu userIds rỗng ===> mặc định gửi cho tất cả role 'user'
      users = await User.find({ role: 'user' }).lean();
    }

    // Lấy tất cả Expo tokens
    const expoTokens = users
      .filter(u => u.push_token_type === 'expo' && u.expo_push_token && u.expo_push_token.trim() !== '')
      .map(u => u.expo_push_token);

    if (expoTokens.length === 0) return res.status(400).json({ success: false, message: 'Không có Expo token hợp lệ' });

    // Build messages array
    const messages = expoTokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {}
    }));

    const tickets = await sendExpoNotifications(messages);
    return res.json({ success: true, tickets });
  } catch (err) {
    console.error('sendBulkNotification error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.removeToken = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
    await User.findByIdAndUpdate(userId, { expo_push_token: null, token_device: null, push_token_type: null });
    return res.json({ success: true });
  } catch (err) {
    console.error('removeToken error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


