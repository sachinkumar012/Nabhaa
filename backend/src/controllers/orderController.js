const Order = require('../models/orderModel');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (or open with userId in body)
const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            userId,
            isPaid,
            paymentResult,
            status
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const resolvedUserId = (req.user && req.user._id) || userId;
        if (!resolvedUserId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const order = new Order({
            orderItems,
            user: resolvedUserId,
            shippingAddress,
            paymentMethod,
            itemsPrice: itemsPrice || 0,
            taxPrice: taxPrice || 0,
            shippingPrice: shippingPrice || 0,
            totalPrice: totalPrice || 0,
            isPaid: isPaid || false,
            paymentResult: paymentResult || {},
            status: status || 'Pending',
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (err) {
        console.error('addOrderItems error:', err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        console.error('getOrderById error:', err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address
            };
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        console.error('updateOrderToPaid error:', err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private (or userId from query param)
const getMyOrders = async (req, res) => {
    try {
        const userId = (req.user && req.user._id) || req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('getMyOrders error:', err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('getOrders error:', err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
            order.status = 'Delivered';
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        console.error('updateOrderToDelivered error:', err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders
};
