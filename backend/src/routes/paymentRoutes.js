/**
 * Payment Routes — Razorpay integration for COD-to-Online conversion
 * POST /api/payments/create-razorpay-link/:orderId
 * POST /api/payments/razorpay-webhook
 * POST /api/payments/convert-cod/:orderId
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const Customer = require('../models/customerModel');
const { emitOrderUpdate } = require('../utils/notificationService');
const { sendPaymentSuccessEmail, sendCodConversionEmail } = require('../utils/emailService');

// ─── Razorpay Instance (graceful fallback if keys missing) ───────────────────
let razorpay = null;
const RAZORPAY_AVAILABLE = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

if (RAZORPAY_AVAILABLE) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('[RAZORPAY] ✓ Initialized successfully');
} else {
    console.warn('[RAZORPAY] ⚠ Keys not configured — running in demo mode');
}

// ─── Create Razorpay Payment Link for COD Order ───────────────────────────────
router.post('/create-razorpay-link/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('user', 'name email phone');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.isPaid) return res.status(400).json({ success: false, message: 'Order is already paid' });

        const orderId = String(order._id).slice(-8).toUpperCase();

        // Demo mode — return a placeholder link
        if (!RAZORPAY_AVAILABLE) {
            console.log(`[RAZORPAY DEMO] Would generate link for order ${orderId} — ₹${order.totalPrice}`);
            return res.json({
                success: true,
                demo: true,
                message: 'Demo mode: Razorpay keys not configured',
                paymentLink: `#demo-payment-${orderId}`,
                orderId: order._id,
                amount: order.totalPrice
            });
        }

        // Create Razorpay Payment Link
        const paymentLinkResp = await razorpay.paymentLink.create({
            amount: Math.round(order.totalPrice * 100), // in paise
            currency: 'INR',
            accept_partial: false,
            description: `Nabha Healthcare — Order #${orderId}`,
            customer: {
                name: order.user?.name || 'Customer',
                email: order.user?.email || '',
                contact: order.user?.phone || ''
            },
            notify: { sms: false, email: true },
            reminder_enable: true,
            notes: { orderId: String(order._id) },
            callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders?payment=success&orderId=${order._id}`,
            callback_method: 'get',
            expire_by: Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000) // 24h from now
        });

        // Save payment link to order
        order.paymentLink = {
            url: paymentLinkResp.short_url,
            linkId: paymentLinkResp.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        await order.save();

        // Send email with payment link
        if (order.user?.email) {
            sendCodConversionEmail(
                { name: order.user.name, email: order.user.email },
                order,
                paymentLinkResp.short_url
            ).catch(e => console.error('[EMAIL] COD link email failed:', e.message));
        }

        res.json({
            success: true,
            paymentLink: paymentLinkResp.short_url,
            linkId: paymentLinkResp.id,
            orderId: order._id,
            amount: order.totalPrice
        });
    } catch (err) {
        console.error('[PAYMENT] Create link error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Get Existing Payment Link for an Order ───────────────────────────────────
router.get('/link/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId, 'paymentLink isPaid totalPrice paymentMethod');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        res.json({
            success: true,
            isPaid: order.isPaid,
            paymentMethod: order.paymentMethod,
            paymentLink: order.paymentLink || null
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Razorpay Webhook Handler ─────────────────────────────────────────────────
router.post('/razorpay-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        // Validate webhook signature (production security)
        if (RAZORPAY_AVAILABLE && process.env.RAZORPAY_WEBHOOK_SECRET) {
            const crypto = require('crypto');
            const signature = req.headers['x-razorpay-signature'];
            const body = req.body;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
                .update(body)
                .digest('hex');

            if (signature !== expectedSignature) {
                return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
            }
        }

        const event = JSON.parse(req.body);
        console.log(`[WEBHOOK] Razorpay event: ${event.event}`);

        if (event.event === 'payment_link.paid') {
            const notes = event.payload?.payment_link?.entity?.notes || {};
            const orderId = notes.orderId;

            if (orderId) {
                const order = await Order.findById(orderId).populate('user', 'name email');
                if (order && !order.isPaid) {
                    order.isPaid = true;
                    order.paidAt = new Date();
                    order.paymentResult = {
                        id: event.payload.payment?.entity?.id || '',
                        status: 'completed',
                        update_time: new Date().toISOString()
                    };
                    order.statusHistory = order.statusHistory || [];
                    order.statusHistory.push({ status: 'Accepted', timestamp: new Date(), note: 'Payment received online' });
                    order.status = 'Accepted';
                    await order.save();

                    const io = req.app.get('io');
                    emitOrderUpdate(io, order, 'payment_success', { message: 'Payment confirmed!' });

                    if (order.user?.email) {
                        sendPaymentSuccessEmail(
                            { name: order.user.name, email: order.user.email },
                            order
                        ).catch(e => console.error('[EMAIL] Payment success email failed:', e.message));
                    }
                }
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error('[WEBHOOK] Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Manual COD-to-Paid Conversion (for demo/testing) ───────────────────────
router.put('/convert-cod/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('user', 'name email');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.isPaid) return res.status(400).json({ success: false, message: 'Already paid' });

        const { paymentId } = req.body;

        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
            id: paymentId || 'manual',
            status: 'completed',
            update_time: new Date().toISOString()
        };
        order.status = 'Accepted';
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({ status: 'Accepted', timestamp: new Date(), note: 'COD converted to online payment' });
        await order.save();

        const io = req.app.get('io');
        emitOrderUpdate(io, order, 'payment_success', { message: 'Payment confirmed — order prioritized!' });

        if (order.user?.email) {
            sendPaymentSuccessEmail(
                { name: order.user.name, email: order.user.email },
                order
            ).catch(e => console.error('[EMAIL] Payment success email error:', e.message));
        }

        res.json({ success: true, message: 'Payment confirmed successfully', order });
    } catch (err) {
        console.error('[PAYMENT] Convert COD error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
