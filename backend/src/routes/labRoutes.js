const express = require('express');
const router = express.Router();
const LabTest = require('../models/labTestModel');
const LabBooking = require('../models/labBookingModel');
const { sendLabBookingConfirmation } = require('../utils/emailService');

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

module.exports = router;
