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
        type: String,
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
        type: String,
        default: '24-48 hours'
    },
    reportTime: {
        type: String
    },
    sampleType: {
        type: String
    },
    availableSlots: [{
        type: String
    }],
    fastingRequired: {
        type: Boolean,
        default: false
    },
    recommendedFor: {
        type: String
    },
    pharmacist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacist',
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);
