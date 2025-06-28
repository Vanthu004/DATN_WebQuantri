const User = require('../models/user');

// Middleware kiểm tra email đã được xác nhận
exports.requireEmailVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }
    
    if (!user.email_verified) {
      return res.status(403).json({ 
        message: 'Vui lòng xác nhận email trước khi thực hiện hành động này',
        emailNotVerified: true
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Middleware kiểm tra email đã được xác nhận (optional)
exports.optionalEmailVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }
    
    // Thêm thông tin email verification vào request
    req.user.emailVerified = user.email_verified;
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 