const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    type: {
        type: String,
        enum: ['prescription', 'report', 'xray', 'allergy', 'consultation', 'other'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    diagnosis: {
        type: String
    },
    notes: {
        type: String
    },
    fileUrl: {
        type: String
    },
    offlineId: {
        type: String,
        unique: true,
        sparse: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

healthRecordSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
