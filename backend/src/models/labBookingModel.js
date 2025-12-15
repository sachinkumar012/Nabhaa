const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null if guest checkout allowed later, but user wants login
    },
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabTest',
        required: true
    },
    patientDetails: {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true }
    },
    collectionDate: {
        type: Date,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'cod'],
        default: 'cod' // Assuming Pay on Collection for now
    }
}, { timestamps: true });

module.exports = mongoose.model('LabBooking', labBookingSchema);
