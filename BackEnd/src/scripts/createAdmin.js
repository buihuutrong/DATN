const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const createAdmin = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect('mongodb://localhost:27017/DOANTN', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Kiểm tra xem admin đã tồn tại chưa
        const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
        if (existingAdmin) {
            console.log('Admin account already exists');
            process.exit(0);
        }

        // Tạo mật khẩu đã mã hóa
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Tạo tài khoản admin
        const admin = new User({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'admin',
            isVerified: true
        });

        await admin.save();
        console.log('Admin account created successfully');
        console.log('Email: admin@gmail.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error('Error creating admin account:', error);
    } finally {
        mongoose.disconnect();
    }
};

createAdmin(); 