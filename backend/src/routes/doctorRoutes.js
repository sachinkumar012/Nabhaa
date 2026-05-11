const express = require('express');
const router = express.Router();
const {
    getDoctors,
    authDoctor,
    registerDoctor,
    getDoctorProfile,
    getDoctorPatients,
    getPatientHistory,
    createPrescription
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getDoctors);
router.post('/login', authDoctor);
router.post('/register', registerDoctor);
router.route('/profile').get(protect, getDoctorProfile);

// New Doctor Dashboard Routes
router.route('/patients').get(protect, getDoctorPatients);
router.route('/patients/:email/history').get(protect, getPatientHistory);
router.route('/prescriptions').post(protect, createPrescription);

module.exports = router;
