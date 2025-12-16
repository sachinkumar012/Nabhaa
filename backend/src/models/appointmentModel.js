const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    patientEmail: {
        type: String,
        required: false // Optional for instant calls if not logged in
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: String, // Storing as string for simplicity 'YYYY-MM-DD'
        required: true
    },
    time: {
        type: String, // 'HH:MM'
        required: true
    },
    type: {
        type: String,
        enum: ['instant', 'scheduled'],
        default: 'scheduled'
    },
    status: {
        type: String,
        enum: ['scheduled', 'waiting', 'active', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    videoCallId: {
        type: String,
        required: true
    },
    meetingLink: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
