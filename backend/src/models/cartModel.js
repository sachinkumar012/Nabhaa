const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1, min: 1, max: 99 },
    packSize: { type: String, default: '' },
    type: { type: String, default: 'Medicine' },
    image: { type: String, default: '' },
    source: { type: String, enum: ['normal', 'prescription'], default: 'normal' },
}, { _id: false });

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        unique: true,
    },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now },
});

cartSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Cart', cartSchema);
