const express = require('express');
const router = express.Router();
const {
    registerPharmacist,
    loginPharmacist,
    sendPharmacistOtp,
    verifyPharmacistOtp,
    getPharmacistProfile,
    updatePharmacistProfile,
    getDashboardAnalytics
} = require('../controllers/pharmacistController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerPharmacist);
router.post('/login', loginPharmacist);
router.post('/send-otp', sendPharmacistOtp);
router.post('/verify-otp', verifyPharmacistOtp);

// Protected routes
router.use(protect);
router.get('/profile', getPharmacistProfile);
router.put('/profile', updatePharmacistProfile);
router.get('/analytics', authorize('pharmacist'), getDashboardAnalytics);

module.exports = router;
