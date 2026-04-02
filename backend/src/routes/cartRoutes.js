const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart,
} = require('../controllers/cartController');

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/sync', syncCart);
router.put('/update', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/remove/:productId', removeFromCart);

module.exports = router;
