const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        dob: {
            type: Date,
            required: true,
        },
        planId: {
            type: Number,
            required: true,
        },
        planName: {
            type: String,
            required: true,
        },
        coverage: {
            type: String,
            required: true,
        },
        premiumPaid: {
            type: Number,
            required: true,
        },
        policyNumber: {
            type: String,
            unique: true,
            required: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Pending', 'Expired', 'Cancelled'],
            default: 'Active',
        },
        paymentDetails: {
            method: {
                type: String,
                required: true, // e.g., 'Online', 'Cash on Delivery'
            },
            transactionId: {
                type: String,
            },
            amount: {
                type: Number,
            },
            status: {
                type: String,
                default: 'Paid',
            },
            paidAt: {
                type: Date,
                default: Date.now,
            }
        },
        validTill: {
            type: Date,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Insurance', insuranceSchema);
