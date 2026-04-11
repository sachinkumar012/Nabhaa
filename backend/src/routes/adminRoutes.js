const express = require('express');
const router = express.Router();
const {
    authAdmin,
    getDashboardStats,
    getAllUsers,
    getAllDoctors,
    approveDoctor,
    registerAdmin,
    sendAdminOtp,
    verifyAdminOtp,
    updateUserStatus,
    getAllPharmacists,
    updatePharmacistStatus,
    getAllOrders,
    createDoctor
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

console.log('Admin Routes Loaded');



router.post('/login', authAdmin);
router.post('/send-otp', sendAdminOtp);
router.post('/verify-otp', verifyAdminOtp);
router.post('/register', registerAdmin);
// Dashboard & Metrics
router.get('/dashboard', protect, admin, getDashboardStats);

// Users Management
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/status', protect, admin, updateUserStatus);

// Pharmacists (Partners) Management
router.get('/pharmacists', protect, admin, getAllPharmacists);
router.put('/pharmacists/:id/status', protect, admin, updatePharmacistStatus);

// Orders Monitoring
router.get('/orders', protect, admin, getAllOrders);

// Doctors Control
router.get('/doctors', protect, admin, getAllDoctors);
router.post('/doctors', protect, admin, createDoctor);
router.put('/doctors/:id/approve', protect, admin, approveDoctor);

module.exports = router;
