const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  console.log('Running authMiddleware version: 2025-08-03');
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET không được định nghĩa trong biến môi trường');
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Header Authorization không hợp lệ' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);

    if (!decoded.userId) {
      return res.status(401).json({ message: 'Token không chứa userId hợp lệ' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.ban?.isBanned) {
      if (!user.ban.bannedUntil || user.ban.bannedUntil > new Date()) {
        return res.status(403).json({
          message: `Tài khoản của bạn đã bị khóa` +
            (user.ban.bannedUntil ? ` đến ${user.ban.bannedUntil.toLocaleString('vi-VN')}` : ' vĩnh viễn') +
            (user.ban.reason ? ` vì: ${user.ban.reason}` : ''),
        });
      } else {
        user.ban.isBanned = false;
        user.ban.bannedUntil = null;
        user.ban.reason = '';
        await user.save();
      }
    }

    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }
    return res.status(403).json({ message: 'Token không hợp lệ', error: err.message });
  }
};