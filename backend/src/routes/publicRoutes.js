const express = require('express');
const router = express.Router();
const { sendConsultationRequest } = require('../utils/emailService');

router.post('/consultation', async (req, res) => {
    try {
        const { name, mobile, city, problem } = req.body;
        if (!name || !mobile || !problem) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        const success = await sendConsultationRequest({ name, mobile, city, problem });
        if (success) {
            res.status(200).json({ success: true, message: 'Consultation request sent successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send consultation request' });
        }
    } catch (error) {
        console.error('Consultation request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
