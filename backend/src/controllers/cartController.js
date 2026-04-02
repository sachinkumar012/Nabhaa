const Cart = require('../models/cartModel');
const mongoose = require('mongoose');

/* ── Helper: get userId from request ─────────────────────────────────────── */
const getUserId = (req) => {
    if (req.user && req.user._id) return req.user._id;
    if (req.body && req.body.userId) return req.body.userId;
    if (req.query && req.query.userId) return req.query.userId;
    return null;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ── GET /api/cart ──────────────────────────────────────────────────────── */
const getCart = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId || !isValidObjectId(userId)) {
            return res.json({ items: [] });
        }
        const cart = await Cart.findOne({ userId });
        res.json({ items: cart ? cart.items : [] });
    } catch (err) {
        console.error('getCart error:', err);
        res.status(500).json({ message: err.message });
    }
};

/* ── POST /api/cart/add ─────────────────────────────────────────────────── */
const addToCart = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(400).json({ message: 'Valid userId required' });
        }
        if (!isValidObjectId(String(userId))) {
            return res.status(400).json({ message: `Invalid userId format: ${userId}` });
        }

        const { productId, name, price, quantity = 1, packSize = '', type = 'Medicine', image = '', source = 'normal' } = req.body;
        if (!productId || !name || price == null) {
            return res.status(400).json({ message: 'productId, name, price required' });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existing = cart.items.find(i => i.productId === String(productId));
        if (existing) {
            existing.quantity = Math.min(99, existing.quantity + Number(quantity));
        } else {
            cart.items.push({ productId: String(productId), name, price: Number(price), quantity: Math.min(99, Number(quantity)), packSize: String(packSize || ''), type: String(type || 'Medicine'), image: String(image || ''), source });
        }

        await cart.save();
        res.json({ items: cart.items });
    } catch (err) {
        console.error('addToCart error:', err);
        res.status(500).json({ message: err.message });
    }
};

/* ── PUT /api/cart/update ───────────────────────────────────────────────── */
const updateCartItem = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId || !isValidObjectId(userId)) {
            return res.status(400).json({ message: 'Valid userId required' });
        }

        const { productId, quantity } = req.body;
        if (!productId) return res.status(400).json({ message: 'productId required' });

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        if (quantity <= 0) {
            cart.items = cart.items.filter(i => i.productId !== String(productId));
        } else {
            const item = cart.items.find(i => i.productId === String(productId));
            if (item) item.quantity = Math.min(99, quantity);
        }

        await cart.save();
        res.json({ items: cart.items });
    } catch (err) {
        console.error('updateCartItem error:', err);
        res.status(500).json({ message: err.message });
    }
};

/* ── DELETE /api/cart/remove/:productId ─────────────────────────────────── */
const removeFromCart = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId || !isValidObjectId(userId)) {
            return res.status(400).json({ message: 'Valid userId required' });
        }

        const { productId } = req.params;
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(i => i.productId !== String(productId));
        await cart.save();
        res.json({ items: cart.items });
    } catch (err) {
        console.error('removeFromCart error:', err);
        res.status(500).json({ message: err.message });
    }
};

/* ── DELETE /api/cart/clear ─────────────────────────────────────────────── */
const clearCart = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId || !isValidObjectId(userId)) {
            return res.status(400).json({ message: 'Valid userId required' });
        }

        const cart = await Cart.findOne({ userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ items: [] });
    } catch (err) {
        console.error('clearCart error:', err);
        res.status(500).json({ message: err.message });
    }
};

/* ── POST /api/cart/sync ────────────────────────────────────────────────── */
/* Bulk sync: replace cart items entirely (used on login to merge localStorage) */
const syncCart = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(400).json({ message: 'userId required' });
        }
        const userIdStr = String(userId);
        if (!isValidObjectId(userIdStr)) {
            return res.status(400).json({ message: `Invalid userId format: ${userIdStr}` });
        }

        const { items = [] } = req.body;
        let cart = await Cart.findOne({ userId: userIdStr });
        if (!cart) {
            cart = new Cart({ userId: userIdStr, items: [] });
        }

        /* Merge: skip malformed items */
        items.forEach(incoming => {
            try {
                if (!incoming.productId || !incoming.name || incoming.price == null) return;
                const existing = cart.items.find(i => i.productId === String(incoming.productId));
                if (existing) {
                    existing.quantity = Math.min(99, existing.quantity + (Number(incoming.quantity) || 1));
                } else {
                    cart.items.push({
                        productId: String(incoming.productId),
                        name: String(incoming.name),
                        price: Number(incoming.price) || 0,
                        quantity: Math.min(99, Number(incoming.quantity) || 1),
                        packSize: String(incoming.packSize || ''),
                        type: String(incoming.type || 'Medicine'),
                        image: String(incoming.image || ''),
                        source: ['normal', 'prescription'].includes(incoming.source) ? incoming.source : 'normal',
                    });
                }
            } catch (itemErr) {
                console.warn('Skipping invalid cart item:', itemErr.message);
            }
        });

        await cart.save();
        res.json({ items: cart.items });
    } catch (err) {
        console.error('syncCart error:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart };
