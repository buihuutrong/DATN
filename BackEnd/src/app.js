const express = require('express'); // Khởi tạo Express
const connectDB = require('./config/db'); // Import hàm kết nối MongoDB
require('dotenv').config(); // Load biến môi trường từ file .env
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Thêm admin routes
const foodRoutes = require('./routes/foodRoutes');
const path = require('path'); // Thêm module path

const app = express(); // Tạo ứng dụng Express

const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:8888', 'http://localhost:3000'],
    credentials: true
}));

// Kết nối tới MongoDB
connectDB();

// // Middleware
// app.use(express.json()); // Parse yêu cầu JSON từ client

app.use(express.json({ limit: '5mb' })); // hoặc lớn hơn nếu cần
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Cấu hình phục vụ file tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, '../public')));

// Định nghĩa các routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes); // Thêm admin routes
app.use('/api/foods', foodRoutes);

// Xử lý lỗi chung
app.use((err, req, res, next) => {
    console.error('Lỗi server:', err.stack); // Ghi log lỗi
    res.status(500).json({ message: 'Đã có lỗi xảy ra!' });
});

// Khởi động server
const PORT = process.env.PORT || 8686; // Lấy port từ .env hoặc mặc định là 5000
app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
}); 