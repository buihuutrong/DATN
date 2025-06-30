const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Áp dụng middleware bảo mật cho tất cả các routes
router.use(protect);
router.use(authorize('admin'));

// Quản lý người dùng
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Quản lý món ăn
router.get('/foods', adminController.getAllFoods);
router.get('/foods/:id', adminController.getFoodById);
router.post('/foods', adminController.createFood);
router.put('/foods/:id', adminController.updateFood);
router.delete('/foods/:id', adminController.deleteFood);
router.put('/foods/:id/approve', adminController.approveFood);

// Quản lý thực đơn
router.get('/menus', adminController.getAllMenus);
router.get('/menus/:id', adminController.getMenuById);
router.put('/menus/:id/approve', adminController.approveMenu);

// Thống kê và báo cáo
router.get('/statistics', adminController.getStatistics);

// Quản lý achievements
router.get('/achievements', adminController.getAllAchievements);
router.post('/achievements', adminController.createAchievement);
router.put('/achievements/:id', adminController.updateAchievement);
router.delete('/achievements/:id', adminController.deleteAchievement);

// Quản lý cài đặt hệ thống
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// // Thêm route tạo tài khoản admin
// router.post('/create-admin', adminController.createAdminAccount);

module.exports = router; 