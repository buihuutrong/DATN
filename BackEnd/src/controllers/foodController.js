const Food = require('../models/food');
const multer = require('multer');

// Hàm createFood đã được sửa lỗi
exports.createFood = async (req, res) => {
    try {
        // Dữ liệu món ăn được gửi dưới dạng chuỗi JSON trong trường 'data'
        if (!req.body.data) {
            return res.status(400).json({ success: false, message: 'Trường "data" chứa thông tin món ăn bị thiếu.' });
        }
        const foodData = JSON.parse(req.body.data);

        // Nếu có file ảnh được upload, thêm đường dẫn ảnh
        if (req.file) {
            foodData.image = '/images/foods/' + req.file.filename;
        }

        // Tạo món ăn mới
        const newFood = new Food(foodData);
        await newFood.save();

        res.status(201).json({
            success: true,
            data: newFood,
            message: 'Tạo món ăn thành công'
        });
    } catch (error) {
        console.error("Create food error:", error); // Thêm log để dễ debug
        // Xử lý lỗi từ multer (nếu có)
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: `Lỗi upload file: ${error.message}` });
        }
        // Xử lý lỗi JSON parse
        if (error instanceof SyntaxError) {
            return res.status(400).json({ success: false, message: 'Dữ liệu gửi lên không phải là một chuỗi JSON hợp lệ.' });
        }
        // Xử lý lỗi validation của Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                details: messages
            });
        }
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Xem chi tiết món ăn theo id
exports.getFoodDetail = async (req, res) => {
    try {
        const foodId = req.params.id;
        const food = await Food.findById(foodId);
        if (!food) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
        }
        res.status(200).json({ success: true, data: food });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Sửa thông tin món ăn theo id
// Hàm updateFood đã được sửa lỗi
exports.updateFood = async (req, res) => {
    try {
        const foodId = req.params.id;

        // Dữ liệu món ăn được gửi dưới dạng chuỗi JSON trong trường 'data'
        // Chúng ta cần parse nó để lấy lại object
        if (!req.body.data) {
            return res.status(400).json({ success: false, message: 'Trường "data" chứa thông tin món ăn bị thiếu.' });
        }
        const updateData = JSON.parse(req.body.data);

        // Nếu có file ảnh mới được upload, cập nhật đường dẫn ảnh
        if (req.file) {
            updateData.image = '/images/foods/' + req.file.filename;
        }

        // Mongoose đủ thông minh để chuyển đổi kiểu dữ liệu khi runValidators: true
        // nhưng để chắc chắn, ta có thể tự chuyển đổi các trường số.
        const numericFields = ['calories', 'protein', 'carbs', 'fat'];
        for (const field of numericFields) {
            if (updateData[field] !== undefined) {
                updateData[field] = Number(updateData[field]);
            }
        }

        const updatedFood = await Food.findByIdAndUpdate(foodId, updateData, { new: true, runValidators: true });

        if (!updatedFood) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
        }

        res.status(200).json({ success: true, data: updatedFood, message: 'Cập nhật món ăn thành công' });
    } catch (error) {
        console.error("Update food error:", error); // Thêm log để dễ debug
        // Xử lý lỗi từ multer (nếu có)
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: `Lỗi upload file: ${error.message}` });
        }
        // Xử lý lỗi JSON parse
        if (error instanceof SyntaxError) {
            return res.status(400).json({ success: false, message: 'Dữ liệu gửi lên không phải là một chuỗi JSON hợp lệ.' });
        }
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Xóa món ăn theo id
exports.deleteFood = async (req, res) => {
    try {
        const foodId = req.params.id;
        const deletedFood = await Food.findByIdAndDelete(foodId);
        if (!deletedFood) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
        }
        res.status(200).json({ success: true, message: 'Xóa món ăn thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Tìm kiếm món ăn theo tên hoặc nguyên liệu
exports.searchFoods = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim() === '') {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập từ khóa tìm kiếm' });
        }
        const keyword = q.trim();
        const foods = await Food.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { 'ingredients.name': { $regex: keyword, $options: 'i' } }
            ]
        });
        res.status(200).json({ success: true, data: foods });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Lấy danh sách tất cả món ăn
exports.getAllFoods = async (req, res) => {
    try {
        const foods = await Food.find();
        res.status(200).json({ success: true, data: foods });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};