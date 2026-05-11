const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, updateProfile, getProfile, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/google-login', googleLogin);
router.route('/profile').get(protect, getProfile).put(protect, updateProfile);

module.exports = router;
