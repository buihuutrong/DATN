const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    preferences: [{ type: String }], // Ví dụ: ["spicy", "vegan"]
    restrictions: [{ type: String }], // Ví dụ: ["no_peanuts", "low_sugar"]
    context: {
        mealTime: [{ type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'] }],
        season: { type: String, enum: ['spring', 'summer', 'autumn', 'winter'] },
        weather: { type: String, enum: ['hot', 'cold', 'rainy'] }
    },
    ingredients: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        note: { type: String }
    }],
    instructions: [{ type: String, required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Food', foodSchema, 'Food');