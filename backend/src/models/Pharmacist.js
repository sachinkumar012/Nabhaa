const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pharmacistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    pharmacyName: {
        type: String,
        required: [true, 'Please add a pharmacy name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    licenseNumber: {
        type: String,
        required: [true, 'Please add a license number'],
        unique: true
    },
    verificationStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    documents: [{
        type: String // File URLs for uploaded documents
    }],
    profileImage: {
        type: String,
        default: 'no-photo.jpg'
    },
    role: {
        type: String,
        default: 'pharmacist'
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
pharmacistSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match pharmacist entered password to hashed password in database
pharmacistSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Pharmacist', pharmacistSchema);
