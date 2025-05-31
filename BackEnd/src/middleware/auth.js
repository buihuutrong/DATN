const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware xác thực token JWT
exports.protect = async (req, res, next) => {
    // Lấy token từ header Authorization
    const authHeader = req.header('Authorization');

    // Kiểm tra header có tồn tại và đúng định dạng
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Không có token, truy cập bị từ chối',
        });
    }

    // Lấy token từ header (loại bỏ phần "Bearer ")
    const token = authHeader.replace('Bearer ', '');

    try {
        // Xác minh token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Lấy thông tin người dùng từ database
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                message: 'Người dùng không tồn tại',
            });
        }

        // Gắn thông tin người dùng vào req
        req.user = user;

        // Chuyển sang middleware/controller tiếp theo
        next();
    } catch (error) {
        // Xử lý lỗi token (hết hạn, không hợp lệ, v.v.)
        const message =
            error.name === 'TokenExpiredError'
                ? 'Token đã hết hạn'
                : 'Token không hợp lệ';
        return res.status(401).json({
            message,
        });
    }
};

// Middleware kiểm tra vai trò người dùng
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Kiểm tra vai trò của người dùng
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Vai trò ${req.user.role} không được phép truy cập`,
            });
        }
        next();
    };
};