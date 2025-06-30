const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth'); // Import protect và authorize

// Định nghĩa route cho đăng ký
router.post('/register', userController.register);

// Route xác thực email
router.get('/verify-email', userController.verifyEmail);

router.post('/login', userController.login);

// Route lấy thông tin người dùng hiện tại (yêu cầu xác thực)
router.get('/me', protect, userController.getUser);

// Route lấy tất cả người dùng (chỉ admin)
router.get('/all', protect, authorize('admin'), userController.getAllUsers);

// Route xóa người dùng (chỉ admin)
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);
// Route tạo profile dinh dưỡng
router.post('/profile', protect, userController.createProfile);
// Route cập nhật profile dinh dưỡng
router.put('/profile', protect, userController.updateProfile);

router.post('/progress', protect, userController.addProgress);

router.get('/progress', protect, userController.getProgress);

router.post('/menus', protect, userController.createMenu);

router.post('/similar-foods', userController.getSimilarFoods);

// Get total number of users
router.get('/total', protect, authorize('admin'), userController.getTotalUsers);

// Quên mật khẩu
router.post('/forgot-password', userController.forgotPassword);
// Đặt lại mật khẩu
router.post('/reset-password', userController.resetPassword);

// Đổi mật khẩu
router.put('/change-password', protect, userController.changePassword);

module.exports = router;