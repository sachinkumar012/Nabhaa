const { sendAppointmentEmail } = require('../utils/emailService');

exports.bookAppointment = async (req, res) => {
    const { name, age, gender, phone, email, date, time, reason } = req.body;

    // In a real app, this would save to MongoDB
    console.log("Appointment Booking Request:", req.body);

    if (!name || !phone || !date || !time) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (name, phone, date, time)"
        });
    }

    // Send Email
    let emailSent = false;
    if (email) {
        emailSent = await sendAppointmentEmail(email, {
            name,
            date,
            time,
            reason,
            doctor: req.body.doctor || 'Dr. Sachin Kumar', // Default if missing
            id: 'NABHA-' + Math.floor(1000 + Math.random() * 9000)
        });
    }

    // Mock success response
    res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        data: {
            id: 'apt_' + Date.now(),
            ...req.body,
            status: 'confirmed',
            emailSent: emailSent
        }
    });
};
