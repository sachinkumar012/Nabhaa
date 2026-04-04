const express = require('express');
const router = express.Router();
const LabTest = require('../models/labTestModel');
const LabBooking = require('../models/labBookingModel');
const { sendLabBookingConfirmation, sendCallbackRequest } = require('../utils/emailService');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- MANAGEMENT ROUTES (Pharmacist) ---

// Create new lab test
router.post('/tests', protect, authorize('pharmacist'), async (req, res) => {
    try {
        const test = new LabTest({
            ...req.body,
            pharmacist: req.user._id
        });
        await test.save();
        res.status(201).json({ success: true, data: test });
    } catch (error) {
        console.error('Create Lab Test Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update lab test
router.put('/tests/:id', protect, authorize('pharmacist'), async (req, res) => {
    try {
        let test = await LabTest.findById(req.params.id);
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
        
        // Ensure pharmacist owns this test
        if (test.pharmacist.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this test' });
        }

        test = await LabTest.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        });
        res.json({ success: true, data: test });
    } catch (error) {
        console.error('Update Lab Test Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete lab test
router.delete('/tests/:id', protect, authorize('pharmacist'), async (req, res) => {
    try {
        const test = await LabTest.findById(req.params.id);
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

        if (test.pharmacist.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this test' });
        }

        await test.deleteOne();
        res.json({ success: true, message: 'Lab test removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- PUBLIC / PATIENT ROUTES ---

// Request a callback — sends phone number to admin Gmail
router.post('/callback', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone || !/^\d{10}$/.test(phone.toString().trim())) {
            return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number.' });
        }
        await sendCallbackRequest(phone.toString().trim());
        res.json({ success: true, message: 'Callback request received! Our advisor will call you shortly.' });
    } catch (error) {
        console.error('[Callback Route] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit callback request.' });
    }
});


// Get all lab tests
router.get('/tests', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const tests = await LabTest.find(query);
        res.json({ success: true, data: tests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single test
router.get('/tests/:id', async (req, res) => {
    try {
        const test = await LabTest.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        // Get recommendations (same category)
        const recommendations = await LabTest.find({
            category: test.category,
            _id: { $ne: test._id }
        }).limit(3);

        res.json({ success: true, data: test, recommendations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Book a test
router.post('/book', async (req, res) => {
    try {
        const { testId, patientDetails, userId } = req.body;

        const test = await LabTest.findById(testId);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        const booking = new LabBooking({
            test: testId,
            pharmacist: test.pharmacist,
            user: userId,
            patientDetails,
            status: 'confirmed'
        });

        await booking.save();

        // Send email
        try {
            await sendLabBookingConfirmation(patientDetails.email, {
                patientName: patientDetails.name,
                testName: test.title,
                date: new Date().toLocaleDateString(),
                price: test.price,
                orderId: booking._id
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the booking if email fails, just log it
        }

        res.status(201).json({ success: true, message: 'Booking confirmed!', bookingId: booking._id });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user bookings
router.get('/my-bookings', async (req, res) => {
    try {
        const { userId, email } = req.query;
        let query = {};

        if (userId && userId !== 'undefined' && userId !== 'null') {
            query.user = userId;
        } else if (email) {
            query['patientDetails.email'] = email;
        } else {
            return res.status(400).json({ success: false, message: 'User ID or Email required' });
        }

        const bookings = await LabBooking.find(query).populate('test').sort({ createdAt: -1 });
        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get pharmacist's test bookings
router.get('/pharmacist/bookings', async (req, res) => {
    try {
        const pharmacistId = req.query.pharmacistId || (req.user && req.user._id);

        if (!pharmacistId) {
            return res.status(400).json({ success: false, message: 'Pharmacist ID required' });
        }

        const bookings = await LabBooking.find({ pharmacist: pharmacistId })
            .populate('test')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error("Error fetching pharmacist bookings:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
