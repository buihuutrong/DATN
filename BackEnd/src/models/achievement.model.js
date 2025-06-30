const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement; 