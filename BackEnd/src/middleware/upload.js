const multer = require('multer');
const path = require('path');

// Kiểm tra xem thư mục có tồn tại không, nếu không thì tạo mới
const fs = require('fs');
const dir = 'public/images/foods';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/foods/');
    },
    filename: function (req, file, cb) {
        // Tạo tên file độc nhất để tránh bị ghi đè
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Chỉ cho phép upload file ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Giới hạn 5MB
});

module.exports = upload; 