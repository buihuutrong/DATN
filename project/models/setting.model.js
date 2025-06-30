const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    // Cài đặt chung
    siteName: {
        type: String,
        default: 'Menu Optimization System'
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },

    // Cài đặt thông báo
    notificationSettings: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        },
        reminderTime: {
            type: String,
            default: '09:00'
        }
    },

    // Cài đặt compliance
    complianceSettings: {
        minCompliance: {
            type: Number,
            default: 60
        },
        targetCompliance: {
            type: Number,
            default: 80
        },
        streakThreshold: {
            type: Number,
            default: 7
        }
    },

    // Cài đặt menu
    menuSettings: {
        maxFoodsPerMeal: {
            type: Number,
            default: 5
        },
        minFoodsPerMeal: {
            type: Number,
            default: 2
        },
        requireApproval: {
            type: Boolean,
            default: true
        }
    },

    // Cài đặt food
    foodSettings: {
        requireApproval: {
            type: Boolean,
            default: true
        },
        allowUserSubmission: {
            type: Boolean,
            default: true
        },
        maxCalories: {
            type: Number,
            default: 1000
        }
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

settingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Setting', settingSchema); 