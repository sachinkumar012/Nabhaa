/**
 * Centralized Real-Time Notification Service
 * Handles socket.io emissions + email retry logic for order lifecycle events.
 */

const { sendOrderStatusEmail, sendCodConversionEmail } = require('./emailService');

const MAX_RETRIES = 3;

/**
 * Emit an order update event to all relevant socket rooms with retry-safe logic.
 * Rooms: user_<id>, pharmacist_<id>, admin
 *
 * @param {Object} io - The socket.io server instance
 * @param {Object} order - The Mongoose order document (populated)
 * @param {string} event - Socket event name
 * @param {Object} extra - Additional payload data
 */
const emitOrderUpdate = (io, order, event = 'order_update', extra = {}) => {
    if (!io) return;

    const payload = {
        orderId: order._id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        isPaid: order.isPaid,
        totalPrice: order.totalPrice,
        statusHistory: order.statusHistory || [],
        timestamp: new Date().toISOString(),
        ...extra
    };

    // Notify customer
    if (order.user) {
        const userId = order.user._id || order.user;
        io.to(`user_${userId}`).emit(event, payload);
    }

    // Notify pharmacist
    if (order.pharmacist) {
        const pharmId = order.pharmacist._id || order.pharmacist;
        io.to(`pharmacist_${pharmId}`).emit(event, payload);
    }

    // Notify admin room
    io.to('admin_room').emit(event, payload);

    console.log(`[SOCKET] Emitted "${event}" for order ${order._id} → status: ${order.status}`);
};

/**
 * Send order status email with retry mechanism (exponential backoff).
 *
 * @param {Object} customer - { name, email }
 * @param {Object} order - Full order document
 * @param {string} newStatus - The new order status
 * @param {number} attempt - Current retry attempt
 */
const sendStatusEmailWithRetry = async (customer, order, newStatus, attempt = 1) => {
    try {
        await sendOrderStatusEmail(customer, order, newStatus);
        console.log(`[EMAIL] Status email sent for order ${order._id} → ${newStatus}`);
    } catch (err) {
        console.error(`[EMAIL] Attempt ${attempt} failed for order ${order._id}:`, err.message);
        if (attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            setTimeout(() => sendStatusEmailWithRetry(customer, order, newStatus, attempt + 1), delay);
        } else {
            console.error(`[EMAIL] All ${MAX_RETRIES} attempts failed for order ${order._id}`);
        }
    }
};

/**
 * Send COD conversion email with retry mechanism.
 *
 * @param {Object} customer - { name, email }
 * @param {Object} order - Full order document
 * @param {string} paymentLink - Razorpay payment URL
 * @param {number} attempt - Current retry attempt
 */
const sendCodEmailWithRetry = async (customer, order, paymentLink, attempt = 1) => {
    try {
        await sendCodConversionEmail(customer, order, paymentLink);
        console.log(`[EMAIL] COD conversion email sent for order ${order._id}`);
    } catch (err) {
        console.error(`[EMAIL] COD email attempt ${attempt} failed:`, err.message);
        if (attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt) * 1000;
            setTimeout(() => sendCodEmailWithRetry(customer, order, paymentLink, attempt + 1), delay);
        }
    }
};

module.exports = { emitOrderUpdate, sendStatusEmailWithRetry, sendCodEmailWithRetry };
