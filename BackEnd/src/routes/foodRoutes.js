const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const upload = require('../middleware/upload');

// Xem chi tiết món ăn theo id
router.get('/:id', foodController.getFoodDetail);

// Sửa thông tin món ăn theo id (có upload ảnh)
router.put('/:id', upload.single('image'), foodController.updateFood);

// Xóa món ăn theo id
router.delete('/:id', foodController.deleteFood);

// Tìm kiếm món ăn
router.get('/search', foodController.searchFoods);

// Lấy danh sách tất cả món ăn
router.get('/', foodController.getAllFoods);

// Tạo món ăn mới (có upload ảnh)
router.post('/', upload.single('image'), foodController.createFood);

module.exports = router; 