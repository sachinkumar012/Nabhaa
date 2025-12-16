const express = require('express');
const router = express.Router();
const {
    getDoctors,
    authDoctor,
    registerDoctor,
    getDoctorProfile
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getDoctors);
router.post('/login', authDoctor);
router.post('/register', registerDoctor);
router.route('/profile').get(protect, getDoctorProfile);

module.exports = router;
