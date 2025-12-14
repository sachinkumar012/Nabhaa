const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        default: function () {
            return this.email.split('@')[0];
        }
    },
    phone: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', ''],
        default: ''
    },
    age: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    abhaAddress: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
