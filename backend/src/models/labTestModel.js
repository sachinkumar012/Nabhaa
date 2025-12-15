const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    category: {
        type: String, // 'Health Packages', 'Diabetes', 'Hormonal', 'Vitamins', 'Heart', 'Kidney'
        required: true
    },
    description: {
        type: String,
        required: true
    },
    features: [{
        type: String
    }],
    reportsWithin: {
        type: String, // e.g., '24-48 hours'
        default: '24-48 hours'
    },
    fastingRequired: {
        type: Boolean,
        default: false
    },
    recommendedFor: {
        type: String // e.g., 'Male/Female > 40 years'
    }
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);
