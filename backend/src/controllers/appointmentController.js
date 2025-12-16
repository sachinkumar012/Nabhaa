const Appointment = require('../models/appointmentModel');
const Doctor = require('../models/doctorModel');
const { sendAppointmentEmail, sendVideoConsultationEmail } = require('../utils/emailService');

exports.bookAppointment = async (req, res) => {
    const { name, age, gender, phone, email, date, time, reason, doctorId, type, videoCallId } = req.body;

    console.log("Appointment Booking Request:", req.body);

    if (!name || !date || !time) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (name, date, time)"
        });
    }

    try {
        let assignedDoctor = null;
        let doctorEmail = null;
        let doctorName = 'Dr. Nabha';

        // 1. Find the doctor if ID is provided
        if (doctorId) {
            assignedDoctor = await Doctor.findById(doctorId);
            if (assignedDoctor) {
                doctorEmail = assignedDoctor.email;
                doctorName = assignedDoctor.name;
            }
        }

        // If no doctor found/provided, maybe assign a default or handle error.
        // For now, ensuring we have a valid doctor ID is critical for the dashboard.
        // If not provided, we can't show it in a specific doctor's dashboard.
        // Assuming the frontend ALWAYS sends a doctorId for video calls.
        if (!assignedDoctor && type === 'instant') {
            return res.status(400).json({ success: false, message: "Doctor ID is required for video calls." });
        }

        // 2. Generate Meeting Link
        // For instant calls, videoCallId is passed. For scheduled, we might generate one now or later.
        // Let's generate one if not provided.
        const callId = videoCallId || `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Construct the full link. NOTE: using a hardcoded base URL or env var would be better.
        // Assuming client runs on typical Vite port or same domain in prod.
        // We will receive the FE base URL from env or request, but let's default to standard.
        const frontendUrl = req.headers.origin || 'http://localhost:5173';
        const meetingLink = `${frontendUrl}/video-call/${callId}?type=doctor&name=${encodeURIComponent(doctorName)}`;


        // 3. Create Appointment Record
        const appointment = await Appointment.create({
            patientName: name,
            patientEmail: email,
            doctor: assignedDoctor ? assignedDoctor._id : null, // Handle null if simplified booking
            date,
            time,
            reason,
            type: type || 'scheduled',
            status: type === 'instant' ? 'waiting' : 'scheduled',
            videoCallId: callId,
            meetingLink
        });

        // 4. Send Email to Doctor
        if (assignedDoctor && doctorEmail) {
            await sendVideoConsultationEmail(doctorEmail, {
                doctorName: assignedDoctor.name,
                patientName: name,
                date,
                time,
                reason,
                type: type || 'scheduled',
                meetingLink
            });
        }

        // 5. Send Confirmation to Patient (existing logic)
        if (email) {
            await sendAppointmentEmail(email, {
                name,
                date,
                time,
                reason,
                doctor: doctorName,
                id: appointment._id
            });
        }

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: appointment
        });

    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getAppointmentsForDoctor = async (req, res) => {
    try {
        // Authenticated doctor ID from middleware
        // NOTE: Ensure your route is protected and req.user is populated.
        // If not passing through auth middleware yet, we might need to pass ID in query, but secure way is req.user.
        // Assuming authMiddleware populates req.user

        // Check if req.user exists, otherwise fail (or accept query param for loose testing if strictly needed)
        const doctorId = req.user ? req.user._id : req.query.doctorId;

        if (!doctorId) {
            return res.status(401).json({ success: false, message: "Unauthorized or Doctor ID missing" });
        }

        const appointments = await Appointment.find({ doctor: doctorId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
