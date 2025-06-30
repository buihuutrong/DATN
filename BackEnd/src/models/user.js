const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'nutritionist'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: '/default-avatar.png'
    },
    nutritionProfile: {
        isComplete: {
            type: Boolean,
            default: false
        },
        age: {
            type: Number,
            min: 1,
            max: 120
        },
        weight: {
            type: Number,
            min: 20,
            max: 300
        },
        height: {
            type: Number,
            min: 100,
            max: 250
        },
        gender: {
            type: String,
            enum: ['male', 'female']
        },
        activityLevel: {
            type: String,
            enum: ['sedentary', 'active', 'veryActive']
        },
        goals: {
            type: String,
            enum: ['weight_loss', 'muscle_gain', 'maintenance']
        },
        medicalConditions: [{
            type: String,
            enum: ['none', 'diabetes', 'heart_disease', 'allergy']
        }],
        preferences: [{
            type: String,
            trim: true
        }],
        restrictions: [{
            type: String,
            trim: true
        }],
        dailyCalorieNeeds: {
            type: Number,
            min: 0
        },
        macroRatio: {
            protein: {
                type: Number,
                min: 0,
                max: 1
            },
            carbs: {
                type: Number,
                min: 0,
                max: 1
            },
            fat: {
                type: Number,
                min: 0,
                max: 1
            }
        },
        bmr: {
            type: Number,
            min: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;