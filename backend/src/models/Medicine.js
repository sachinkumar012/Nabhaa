const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a medicine name'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    manufacturer: {
        type: String,
        required: [true, 'Please add a manufacturer']
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
