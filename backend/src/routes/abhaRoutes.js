const express = require('express');
const router = express.Router();
const abhaController = require('../controllers/abhaController');

router.post('/generate-otp', abhaController.generateOtp);
router.post('/verify-otp', abhaController.verifyOtp);
router.post('/create', abhaController.createAbha);
router.get('/profile', abhaController.getProfile);

module.exports = router;
