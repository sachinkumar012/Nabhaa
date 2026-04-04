const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a medicine name'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Please add a brand name']
    },
    salt: {
        type: String,
        required: [true, 'Please add a salt name']
    },
    dosage: {
        type: String
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    discount: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        default: 0
    },
    expiryDate: {
        type: Date
    },
    images: [{
        type: String
    }],
    description: {
        type: String
    },
    requiresPrescription: {
        type: Boolean,
        default: false
    },
    manufacturer: {
        type: String,
        required: [true, 'Please add a manufacturer']
    },
    pharmacist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacist',
        required: true
    },
    type: {
        type: String,
        default: 'allopathy'
    },
    packSize: {
        type: String
    },
    composition: {
        type: String
    },
    isDiscontinued: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);
