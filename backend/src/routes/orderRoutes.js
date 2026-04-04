const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    getPharmacistOrders,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(addOrderItems)
    .get(protect, getOrders);

router.route('/myorders').get(getMyOrders);
router.route('/pharmacist').get(protect, authorize('pharmacist'), getPharmacistOrders);

router.route('/:id').get(getOrderById);
router.route('/:id/pay').put(updateOrderToPaid);
router.route('/:id/deliver').put(updateOrderToDelivered);
router.route('/:id/status').put(protect, authorize('pharmacist'), updateOrderStatus);

module.exports = router;
