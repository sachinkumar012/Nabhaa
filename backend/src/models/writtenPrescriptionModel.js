const mongoose = require('mongoose');

const writtenPrescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: false
    },
    patientDetails: {
        name: String,
        age: Number,
        gender: String,
        weight: String,
        phone: String
    },
    diagnosis: {
        type: String,
        required: true
    },
    medicines: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g. "500mg"
        frequency: { type: String, required: true }, // e.g. "1-0-1"
        duration: { type: String, required: true }, // e.g. "5 days"
        instructions: { type: String } // e.g. "After food"
    }],
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'finalized'],
        default: 'finalized'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WrittenPrescription', writtenPrescriptionSchema);
