const mongoose = require('mongoose');

const drugInteractionSchema = new mongoose.Schema({
    salt1: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    salt2: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    severity: {
        type: String,
        enum: ['low', 'moderate', 'high', 'contraindicated'],
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Prevent exact duplicate interactions
drugInteractionSchema.index({ salt1: 1, salt2: 1 }, { unique: true });

module.exports = mongoose.model('DrugInteraction', drugInteractionSchema);
