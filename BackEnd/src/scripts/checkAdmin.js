const mongoose = require('mongoose');
const User = require('../models/user');

const checkAdmin = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect('mongodb://localhost:27017/DOANTN', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Tìm tài khoản admin
        const admin = await User.findOne({ email: 'admin@gmail.com' });

        if (admin) {
            console.log('Admin account found:');
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
            console.log('Is Verified:', admin.isVerified);
            console.log('Created At:', admin.createdAt);
        } else {
            console.log('Admin account not found!');
        }

    } catch (error) {
        console.error('Error checking admin account:', error);
    } finally {
        mongoose.disconnect();
    }
};

checkAdmin(); 