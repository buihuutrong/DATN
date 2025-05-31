const User = require('../models/user');
const Food = require('../models/Food');
const Menu = require('../models/Menu');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Utility functions
const calculateNutritionProfile = (userData) => {
    const { age, weight, height, gender, activityLevel, goals, medicalConditions, preferences } = userData;

    // Calculate BMR (Mifflin-St Jeor)
    const bmr = gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    // Calculate TDEE
    const activityFactors = { sedentary: 1.2, light: 1.375, active: 1.55, veryActive: 1.725, extremelyActive: 1.9 };
    let dailyCalorieNeeds = bmr * (activityFactors[activityLevel] || 1.55);

    // Adjust calories based on goals
    dailyCalorieNeeds *= goals === 'weight_loss' ? 0.85 : goals === 'muscle_gain' ? 1.15 : 1;

    // Base macro ratio (balanced for most people)
    let macroRatio = { protein: 0.2, carbs: 0.55, fat: 0.25 };

    // Adjust macro ratio based on goals
    if (goals === 'muscle_gain') {
        macroRatio = { protein: 0.25, carbs: 0.5, fat: 0.25 };
    } else if (goals === 'weight_loss') {
        macroRatio = { protein: 0.3, carbs: 0.45, fat: 0.25 };
    }

    // Adjust macro ratio based on medical conditions
    if (medicalConditions?.includes('diabetes')) {
        macroRatio = { protein: 0.25, carbs: 0.35, fat: 0.4 };
    } else if (medicalConditions?.includes('heart_disease')) {
        macroRatio = { protein: 0.25, carbs: 0.55, fat: 0.2 };
    } else if (medicalConditions?.includes('hypertension')) {
        macroRatio = { protein: 0.25, carbs: 0.5, fat: 0.25 };
    }

    // Adjust macro ratio based on preferences
    if (preferences?.includes('high_protein')) {
        macroRatio.protein = Math.min(macroRatio.protein + 0.1, 0.35);
        macroRatio.carbs = Math.max(macroRatio.carbs - 0.05, 0.45);
        macroRatio.fat = Math.max(macroRatio.fat - 0.05, 0.2);
    } else if (preferences?.includes('low_carb')) {
        macroRatio.carbs = Math.max(macroRatio.carbs - 0.1, 0.35);
        macroRatio.fat = Math.min(macroRatio.fat + 0.05, 0.35);
        macroRatio.protein = Math.min(macroRatio.protein + 0.05, 0.35);
    }

    // Ensure macro ratio sums to 100%
    const totalRatio = macroRatio.protein + macroRatio.carbs + macroRatio.fat;
    if (Math.abs(totalRatio - 1) > 0.01) {
        macroRatio.protein /= totalRatio;
        macroRatio.carbs /= totalRatio;
        macroRatio.fat /= totalRatio;
    }

    return {
        dailyCalorieNeeds: Math.round(dailyCalorieNeeds),
        macroRatio,
        bmr: Math.round(bmr)
    };
};

// Hàm xử lý đăng ký người dùng
exports.register = async (req, res) => {
    console.log('Backend: Starting registration process...');
    const { email, password, name, role } = req.body;

    try {
        // Validate input
        if (!email || !password || !name) {
            console.log('Backend: Missing required fields');
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin',
                required: ['email', 'password', 'name']
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Backend: Invalid email format');
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }

        // Validate password strength
        if (password.length < 8) {
            console.log('Backend: Password too short');
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' });
        }

        // Check for existing user
        console.log('Backend: Checking for existing user with email:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Backend: Email already exists');
            return res.status(409).json({ message: 'Email đã được sử dụng' });
        }

        // Validate role
        const validRoles = ['user', 'admin', 'nutritionist'];
        const userRole = validRoles.includes(role) ? role : 'user';

        // Create new user
        console.log('Backend: Creating new user...');
        const user = new User({
            email: email.trim().toLowerCase(),
            password,
            name: name.trim(),
            role: userRole,
            nutritionProfile: {
                isComplete: false,
                medicalConditions: ['none'],
                preferences: [],
                restrictions: []
            }
        });

        // Save user to database
        console.log('Backend: Saving user to database...');
        await user.save();
        console.log('Backend: User saved successfully with ID:', user._id);

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return success response
        console.log('Backend: Registration successful, sending response...');
        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                nutritionProfile: user.nutritionProfile,
                avatar: user.avatar,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Backend: Registration error:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });

        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email đã được sử dụng' });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Dữ liệu không hợp lệ',
                details: messages
            });
        }

        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
    }
};

// Hàm xử lý đăng nhập
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                nutritionProfile: user.nutritionProfile
            },
        });
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error.message);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
    }
};

// Hàm lấy thông tin người dùng hiện tại
exports.getUser = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error.message);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
    }
};

// Hàm lấy tất cả người dùng (chỉ admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error.message);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
    }
};

// Hàm xóa người dùng (chỉ admin)
exports.deleteUser = async (req, res) => {
    try {
        const { ObjectId } = require('mongoose').Types;
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error.message);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
    }
};

// Hàm tạo hồ sơ dinh dưỡng
exports.createProfile = async (req, res) => {
    try {
        const { age, weight, height, gender, activityLevel, goals, medicalConditions, preferences, restrictions } = req.body;

        // Validation
        if (!age || !weight || !height || !gender || !activityLevel || !goals) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin',
                required: ['age', 'weight', 'height', 'gender', 'activityLevel', 'goals']
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Calculate nutrition profile
        const nutritionData = calculateNutritionProfile({
            age, weight, height, gender, activityLevel, goals, medicalConditions
        });

        // Update user profile
        user.nutritionProfile = {
            isComplete: true,
            age,
            weight,
            height,
            gender,
            activityLevel,
            goals,
            medicalConditions: medicalConditions || ['none'],
            preferences: preferences || [],
            restrictions: restrictions || [],
            ...nutritionData
        };

        await user.save();

        res.status(201).json({
            message: 'Tạo hồ sơ dinh dưỡng thành công',
            profile: user.nutritionProfile
        });
    } catch (error) {
        console.error('Lỗi khi tạo hồ sơ dinh dưỡng:', error.message);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
    }
};

// Hàm cập nhật hồ sơ dinh dưỡng
exports.updateProfile = async (req, res) => {
    try {
        const { age, weight, height, gender, activityLevel, goals, medicalConditions, preferences, restrictions } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        if (!user.nutritionProfile) {
            return res.status(400).json({ message: 'Hồ sơ dinh dưỡng chưa được tạo' });
        }

        // Merge existing profile with updates, using nullish coalescing for numbers
        const updatedProfile = {
            ...user.nutritionProfile,
            age: age !== undefined ? Number(age) : user.nutritionProfile.age,
            weight: weight !== undefined ? Number(weight) : user.nutritionProfile.weight,
            height: height !== undefined ? Number(height) : user.nutritionProfile.height,
            gender: gender || user.nutritionProfile.gender,
            activityLevel: activityLevel || user.nutritionProfile.activityLevel,
            goals: goals || user.nutritionProfile.goals,
            medicalConditions: medicalConditions || user.nutritionProfile.medicalConditions,
            preferences: preferences || user.nutritionProfile.preferences,
            restrictions: restrictions || user.nutritionProfile.restrictions
        };

        // Validate numeric values
        if (updatedProfile.age <= 0 || updatedProfile.weight <= 0 || updatedProfile.height <= 0) {
            return res.status(400).json({
                message: 'Giá trị không hợp lệ',
                details: {
                    age: updatedProfile.age <= 0 ? 'Tuổi phải lớn hơn 0' : null,
                    weight: updatedProfile.weight <= 0 ? 'Cân nặng phải lớn hơn 0' : null,
                    height: updatedProfile.height <= 0 ? 'Chiều cao phải lớn hơn 0' : null
                }
            });
        }

        // Recalculate nutrition data
        const nutritionData = calculateNutritionProfile(updatedProfile);

        // Update user profile
        user.nutritionProfile = {
            ...updatedProfile,
            ...nutritionData,
            isComplete: true
        };

        await user.save();
        console.log('Profile updated successfully:', user.nutritionProfile);

        res.status(200).json({
            message: 'Cập nhật hồ sơ dinh dưỡng thành công',
            profile: user.nutritionProfile
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật hồ sơ dinh dưỡng:', error.message);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
    }
};

// Hàm thêm bản ghi tiến trình sức khỏe
exports.addProgress = async (req, res) => {
    try {
        const { weight, compliance } = req.body;

        // Validation
        if (!weight || compliance === undefined) {
            return res.status(400).json({ message: 'Vui lòng cung cấp cân nặng và mức độ hoàn thành' });
        }
        if (weight <= 0 || compliance < 0 || compliance > 100) {
            return res.status(400).json({ message: 'Cân nặng hoặc mức độ hoàn thành không hợp lệ' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        if (!user.height) {
            return res.status(400).json({ message: 'Vui lòng cập nhật chiều cao trong hồ sơ' });
        }

        // Tính BMI
        const bmi = weight / ((user.height / 100) ** 2);

        // Thêm bản ghi tiến trình
        user.progress.push({ weight, bmi: Math.round(bmi * 10) / 10, compliance });
        user.weight = weight; // Cập nhật cân nặng mới nhất vào hồ sơ
        await user.save();

        res.status(201).json({
            message: 'Thêm bản ghi tiến trình thành công',
            progress: { weight, bmi: Math.round(bmi * 10) / 10, compliance, recordedAt: new Date() }
        });
    } catch (error) {
        console.error('Lỗi khi thêm tiến trình:', error.message);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
    }
};

// Hàm lấy lịch sử tiến trình và gợi ý
exports.getProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const progress = user.progress;
        let trend = 0;
        let suggestion = '';

        // Phân tích xu hướng cân nặng
        if (progress.length > 1) {
            trend = progress[progress.length - 1].weight - progress[0].weight;
        }

        // Gợi ý dựa trên mục tiêu và bệnh lý
        if (user.nutritionProfile?.goals === 'weight_loss') {
            if (trend >= 0 && progress.length > 1) {
                suggestion = 'Cân nặng chưa giảm, cân nhắc giảm 100-200 calo/ngày hoặc tăng hoạt động thể chất.';
            } else if (progress[progress.length - 1]?.compliance < 70) {
                suggestion = 'Mức độ tuân thủ thực đơn thấp, hãy cố gắng tuân thủ hơn để đạt mục tiêu giảm cân.';
            } else {
                suggestion = 'Bạn đang đi đúng hướng, tiếp tục duy trì chế độ ăn và tập luyện!';
            }
        } else if (user.nutritionProfile?.goals === 'muscle_gain') {
            if (trend <= 0 && progress.length > 1) {
                suggestion = 'Cân nặng chưa tăng, cân nhắc tăng 10-20% lượng protein hoặc calo.';
            } else if (progress[progress.length - 1]?.compliance < 70) {
                suggestion = 'Mức độ tuân thủ thực đơn thấp, hãy đảm bảo đủ protein để hỗ trợ tăng cơ.';
            } else {
                suggestion = 'Tiến trình tốt, tiếp tục duy trì chế độ dinh dưỡng và tập luyện!';
            }
        } else if (user.nutritionProfile?.medicalConditions &&
            user.nutritionProfile.medicalConditions.length > 0 &&
            user.nutritionProfile.medicalConditions[0] !== 'none') {
            if (progress[progress.length - 1]?.compliance < 70) {
                suggestion = 'Mức độ tuân thủ thực đơn thấp, hãy kiểm tra với bác sĩ hoặc nutritionist để đảm bảo sức khỏe.';
            } else {
                suggestion = 'Bạn đang tuân thủ tốt, tiếp tục theo dõi sức khỏe và chế độ ăn!';
            }
        } else {
            suggestion = 'Hãy tiếp tục cập nhật tiến trình để nhận gợi ý phù hợp.';
        }

        res.json({
            progress,
            trend: Math.round(trend * 10) / 10,
            suggestion
        });
    } catch (error) {
        console.error('Lỗi khi lấy tiến trình:', error.message);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
    }
};

// Hàm tạo thực đơn cá nhân hóa
exports.createMenu = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        if (!user.dailyCalorieNeeds) {
            return res.status(400).json({ message: 'Vui lòng tạo hồ sơ dinh dưỡng trước' });
        }

        const foods = await Food.find();
        if (foods.length === 0) {
            return res.status(400).json({ message: 'Chưa có dữ liệu món ăn' });
        }

        // Gọi FastAPI để tối ưu thực đơn
        const response = await axios.post('http://localhost:8000/optimize-menu', {
            user: {
                dailyCalorieNeeds: user.dailyCalorieNeeds,
                macroRatio: user.macroRatio,
                preferences: user.preferences || [],
                restrictions: user.restrictions || [],
                medicalConditions: user.medicalConditions || ['none'],
                compliance: user.progress.length > 0 ? user.progress[user.progress.length - 1].compliance : 100
            },
            foods: foods.map(f => ({
                _id: f._id.toString(),
                name: f.name,
                calories: f.calories,
                protein: f.protein,
                carbs: f.carbs,
                fat: f.fat,
                preferences: f.preferences || [],
                restrictions: f.restrictions || []
            }))
        });

        const { foods: selectedFoods, totalCalories, totalProtein, totalCarbs, totalFat } = response.data;

        // Lưu thực đơn
        const menu = new Menu({
            userId: user._id,
            foods: selectedFoods.map(f => f._id),
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFat
        });
        await menu.save();

        // Lấy chi tiết món ăn để trả về
        const populatedMenu = await Menu.findById(menu._id).populate('foods');

        res.status(201).json({
            message: 'Tạo thực đơn thành công',
            menu: {
                foods: populatedMenu.foods,
                totalCalories,
                totalProtein,
                totalCarbs,
                totalFat,
                createdAt: menu.createdAt
            }
        });
    } catch (error) {
        console.error('Lỗi khi tạo thực đơn:', error.message);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
    }
};

// Add this after other endpoints
exports.getSimilarFoods = async (req, res) => {
    try {
        const { targetFood, tolerance = 0.2 } = req.body;

        if (!targetFood) {
            return res.status(400).json({ message: 'Thiếu thông tin món ăn cần tìm' });
        }

        // Validate targetFood has required fields
        if (!targetFood.calories || !targetFood.protein || !targetFood.carbs || !targetFood.fat) {
            return res.status(400).json({ message: 'Thông tin dinh dưỡng của món ăn không đầy đủ' });
        }

        // Find similar foods in database
        const foods = await Food.find({
            _id: { $ne: targetFood._id }, // Exclude the target food
            calories: {
                $gte: targetFood.calories * (1 - tolerance),
                $lte: targetFood.calories * (1 + tolerance)
            },
            protein: {
                $gte: targetFood.protein * (1 - tolerance),
                $lte: targetFood.protein * (1 + tolerance)
            },
            carbs: {
                $gte: targetFood.carbs * (1 - tolerance),
                $lte: targetFood.carbs * (1 + tolerance)
            },
            fat: {
                $gte: targetFood.fat * (1 - tolerance),
                $lte: targetFood.fat * (1 + tolerance)
            }
        }).limit(10);

        if (!foods || foods.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy món ăn phù hợp' });
        }

        res.json({ foods });
    } catch (error) {
        console.error('Error finding similar foods:', error);
        res.status(500).json({ message: 'Lỗi server khi tìm món ăn phù hợp' });
    }
};