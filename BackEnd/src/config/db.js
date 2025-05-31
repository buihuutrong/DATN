
const mongoose = require('mongoose');

// Hàm kết nối tới MongoDB
const connectDB = async () => {
  try {
    // Kết nối tới MongoDB với URL từ biến môi trường MONGO_URI
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Kết nối MongoDB thành công');
  } catch (error) {
    // Ghi log lỗi nếu kết nối thất bại và thoát ứng dụng
    console.error('Lỗi kết nối MongoDB:', error.message);
    process.exit(1); // Thoát với mã lỗi
  }
};

// Xử lý các sự kiện kết nối MongoDB
mongoose.connection.on('connected', () => {
  console.log('Mongoose đã kết nối tới MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Lỗi kết nối Mongoose:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose đã ngắt kết nối với MongoDB');
});

// Xử lý khi ứng dụng bị tắt (ví dụ: nhấn Ctrl+C)
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Kết nối MongoDB đã đóng do ứng dụng bị tắt');
  process.exit(0); // Thoát ứng dụng một cách an toàn
});

module.exports = connectDB;