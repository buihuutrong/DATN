const User = require('../models/user');
const Food = require('../models/food');

const Achievement = require('../models/achievement.model');
const Setting = require('../models/setting.model');
const bcrypt = require('bcrypt');

// Quản lý người dùng
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password -verificationToken');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id, '-password -verificationToken');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
    }
};

// @desc    Cập nhật người dùng bởi Admin
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const userIdToUpdate = req.params.id;
        const adminUserId = req.user.id; // Lấy ID của admin đang thực hiện hành động

        const { name, email, role, isVerified } = req.body;

        // Ngăn admin tự thay đổi vai trò của chính mình
        if (userIdToUpdate === adminUserId && req.body.role && req.body.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Bạn không thể thay đổi vai trò của chính mình.'
            });
        }

        // Dữ liệu cần cập nhật
        const updateFields = { name, email, role, isVerified };

        // Loại bỏ các trường undefined để không ghi đè giá trị không mong muốn
        Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

        const user = await User.findByIdAndUpdate(userIdToUpdate, updateFields, {
            new: true, // Trả về document đã được cập nhật
            runValidators: true // Chạy validation của Mongoose (ví dụ: check email format)
        }).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật người dùng thành công',
            data: user
        });

    } catch (error) {
        // Xử lý lỗi email bị trùng
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email này đã được sử dụng.' });
        }
        // Xử lý lỗi validation khác
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({ success: false, message: `Lỗi validation: ${messages}` });
        }

        console.error('UPDATE USER ERROR:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.status(200).json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa người dùng' });
    }
};

// Quản lý món ăn
exports.getAllFoods = async (req, res) => {
    try {
        const foods = await Food.find();
        res.status(200).json({ foods });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách món ăn' });
    }
};

exports.getFoodById = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ message: 'Không tìm thấy món ăn' });
        }
        res.status(200).json({ food });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin món ăn' });
    }
};

exports.createFood = async (req, res) => {
    try {
        const food = new Food(req.body);
        await food.save();
        res.status(201).json({ message: 'Thêm món ăn thành công', food });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm món ăn' });
    }
};

exports.updateFood = async (req, res) => {
    try {
        const food = await Food.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!food) {
            return res.status(404).json({ message: 'Không tìm thấy món ăn' });
        }
        res.status(200).json({ message: 'Cập nhật món ăn thành công', food });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật món ăn' });
    }
};

exports.deleteFood = async (req, res) => {
    try {
        const food = await Food.findByIdAndDelete(req.params.id);
        if (!food) {
            return res.status(404).json({ message: 'Không tìm thấy món ăn' });
        }
        res.status(200).json({ message: 'Xóa món ăn thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa món ăn' });
    }
};

exports.approveFood = async (req, res) => {
    try {
        const food = await Food.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );
        if (!food) {
            return res.status(404).json({ message: 'Không tìm thấy món ăn' });
        }
        res.status(200).json({ message: 'Phê duyệt món ăn thành công', food });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi phê duyệt món ăn' });
    }
};

// Quản lý thực đơn
exports.getAllMenus = async (req, res) => {
    try {
        const menus = await Menu.find().populate('userId', 'name email');
        res.status(200).json({ menus });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách thực đơn' });
    }
};

exports.getMenuById = async (req, res) => {
    try {
        const menu = await Menu.findById(req.params.id).populate('userId', 'name email');
        if (!menu) {
            return res.status(404).json({ message: 'Không tìm thấy thực đơn' });
        }
        res.status(200).json({ menu });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin thực đơn' });
    }
};

exports.approveMenu = async (req, res) => {
    try {
        const menu = await Menu.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );
        if (!menu) {
            return res.status(404).json({ message: 'Không tìm thấy thực đơn' });
        }
        res.status(200).json({ message: 'Phê duyệt thực đơn thành công', menu });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi phê duyệt thực đơn' });
    }
};

// Thống kê và báo cáo
exports.getStatistics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFoods = await Food.countDocuments();
        const totalMenus = await Menu.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const verifiedUsers = await User.countDocuments({ isVerified: true });

        // Thống kê theo thời gian
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const newUsersLastWeek = await User.countDocuments({ createdAt: { $gte: lastWeek } });
        const newFoodsLastWeek = await Food.countDocuments({ createdAt: { $gte: lastWeek } });
        const newMenusLastWeek = await Menu.countDocuments({ createdAt: { $gte: lastWeek } });

        res.status(200).json({
            totalUsers,
            totalFoods,
            totalMenus,
            activeUsers,
            verifiedUsers,
            lastWeekStats: {
                newUsers: newUsersLastWeek,
                newFoods: newFoodsLastWeek,
                newMenus: newMenusLastWeek
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thống kê' });
    }
};

// Quản lý achievements
exports.getAllAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find();
        res.status(200).json({ achievements });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách achievements' });
    }
};

exports.createAchievement = async (req, res) => {
    try {
        const achievement = new Achievement(req.body);
        await achievement.save();
        res.status(201).json({ message: 'Thêm achievement thành công', achievement });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm achievement' });
    }
};

exports.updateAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!achievement) {
            return res.status(404).json({ message: 'Không tìm thấy achievement' });
        }
        res.status(200).json({ message: 'Cập nhật achievement thành công', achievement });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật achievement' });
    }
};

exports.deleteAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndDelete(req.params.id);
        if (!achievement) {
            return res.status(404).json({ message: 'Không tìm thấy achievement' });
        }
        res.status(200).json({ message: 'Xóa achievement thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa achievement' });
    }
};

// Quản lý cài đặt hệ thống
exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.findOne();
        res.status(200).json({ settings });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy cài đặt hệ thống' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.status(200).json({ message: 'Cập nhật cài đặt thành công', settings });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật cài đặt hệ thống' });
    }
};

// Thêm hàm tạo tài khoản admin
const createAdminAccount = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Kiểm tra xem admin đã tồn tại chưa
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin account already exists'
            });
        }

        // Tạo mật khẩu đã mã hóa
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo tài khoản admin
        const admin = new User({
            name: name || 'Admin',
            email,
            password: hashedPassword,
            role: 'admin',
            isVerified: true
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully'
        });

    } catch (error) {
        console.error('Error creating admin account:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating admin account'
        });
    }
};

// @desc    Lấy tất cả người dùng
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        // Lấy tất cả user, không trả về trường password
        const users = await User.find().select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

