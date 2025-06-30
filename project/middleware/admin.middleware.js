const User = require('../models/user.model');

const verifyAdmin = async (req, res, next) => {
    try {
        // Kiểm tra xem user có tồn tại và có quyền admin không
        const user = await User.findById(req.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                message: 'Không có quyền truy cập'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    verifyAdmin
}; 