const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, default: '' },
            price: { type: Number, required: true },
            medicine: {
                type: mongoose.Schema.Types.Mixed,  // accepts ObjectId or string productId
                ref: 'Medicine',
                required: false
            },
            source: { type: String, default: 'normal' }
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    pharmacist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacist'
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Accepted', 'Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected']
    },
    statusHistory: [
        {
            status: { type: String },
            timestamp: { type: Date, default: Date.now },
            note: { type: String, default: '' }
        }
    ],
    paymentLink: {
        url: { type: String, default: '' },
        linkId: { type: String, default: '' },
        expiresAt: { type: Date }
    },
    notificationLog: [
        {
            type: { type: String },  // 'email' | 'socket' | 'push'
            event: { type: String },
            sentAt: { type: Date, default: Date.now },
            success: { type: Boolean, default: true }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
