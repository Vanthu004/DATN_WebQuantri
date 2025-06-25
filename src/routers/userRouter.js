const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); 
const authController = require('../controllers/authController')
const multer = require('multer');

// Public routes
router.post('/register', userController.createUser);
router.post('/login', userController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/send-verification-email', authController.sendVerificationEmail);
router.post('/verify-email', authController.verifyEmail);

// Protected routes (yêu cầu xác thực)
router.get('/', authMiddleware, userController.getAllUsers);
router.get('/avatar/:id', userController.getAvatar);
router.put('/update-profile', 
  authMiddleware, 
  userController.uploadAvatar, 
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File ảnh không được lớn hơn 5MB' });
      }
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  },
  userController.updateProfile
);
router.put('/change-password', authMiddleware, userController.changePassword);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;