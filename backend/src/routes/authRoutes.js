const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, updateProfile } = require('../controllers/authController');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.put('/profile', updateProfile);

module.exports = router;
