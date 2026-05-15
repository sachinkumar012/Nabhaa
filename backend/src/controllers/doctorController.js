const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');
const WrittenPrescription = require('../models/writtenPrescriptionModel');
const Customer = require('../models/customerModel');
const generateToken = require('../utils/generateToken');

// @desc    Get all doctors (with filters)
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
    const { specialty } = req.query;
    let query = {};

    // Only show approved doctors publicly
    query.isApproved = true;

    if (specialty) {
        query.specialty = { $regex: specialty, $options: 'i' };
    }

    try {
        const doctors = await Doctor.find(query).select('-password'); // Exclude password

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Doctor Login
// @route   POST /api/doctors/login
// @access  Public
const authDoctor = async (req, res) => {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });

    if (doctor && (await doctor.matchPassword(password))) {
        if (!doctor.isApproved) {
            return res.status(401).json({ message: 'Account not approved yet. Please contact admin.' });
        }
        res.json({
            _id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            role: 'doctor',
            token: generateToken(doctor._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new Doctor
// @route   POST /api/doctors/register
// @access  Public
const registerDoctor = async (req, res) => {
    const { name, email, password, specialty, experience, location, image } = req.body;

    const doctorExists = await Doctor.findOne({ email });

    if (doctorExists) {
        return res.status(400).json({ message: 'Doctor already exists' });
    }

    const doctor = await Doctor.create({
        name,
        email,
        password,
        specialty,
        experience,
        location,
        image,
        isApproved: false // Default to false
    });

    if (doctor) {
        res.status(201).json({
            _id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            token: generateToken(doctor._id),
            message: 'Registration successful. Please wait for admin approval.'
        });
    } else {
        res.status(400).json({ message: 'Invalid doctor data' });
    }
};

// @desc    Get Doctor Profile
// @route   GET /api/doctors/profile
// @access  Private
const getDoctorProfile = async (req, res) => {
    try {
        if (!req.user) {
            throw new Error("User not found in request (Middleware failed?)");
        }

        const doctor = await Doctor.findById(req.user._id);

        if (doctor) {
            res.json({
                _id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialty: doctor.specialty,
                experience: doctor.experience,
                location: doctor.location,
                image: doctor.image
            });
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        console.error("Error in getDoctorProfile:", error);
        res.status(500).json({ message: 'Server Error Fetching Profile', error: error.message });
    }
};

// @desc    Get all patients assigned to a doctor
// @route   GET /api/doctors/patients
// @access  Private
const getDoctorPatients = async (req, res) => {
    try {
        const doctorId = req.user._id;

        // Find unique patients from appointments
        const appointments = await Appointment.find({ doctor: doctorId });
        
        // Since Appointment model uses patientName/patientEmail (not always patientId),
        // we'll try to find matching Customer records or return the list from appointments.
        // For a real-world level, we should have a robust link. 
        // Let's assume some appointments have patientEmail we can link to Customer.
        
        const patientEmails = [...new Set(appointments.map(a => a.patientEmail).filter(Boolean))];
        const customers = await Customer.find({ email: { $in: patientEmails } }).select('-password');

        // Merge info
        const patientList = patientEmails.map(email => {
            const customer = customers.find(c => c.email === email);
            const latestApt = appointments.filter(a => a.patientEmail === email).sort((a,b) => new Date(b.date) - new Date(a.date))[0];
            
            return {
                email,
                name: customer ? customer.name : (latestApt ? latestApt.patientName : 'Unknown'),
                id: customer ? customer._id : null,
                lastVisit: latestApt ? latestApt.date : null,
                phone: customer ? customer.phone : null,
                appointmentsCount: appointments.filter(a => a.patientEmail === email).length
            };
        });

        res.json({ success: true, count: patientList.length, data: patientList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get history for a specific patient
// @route   GET /api/doctors/patients/:email/history
// @access  Private
const getPatientHistory = async (req, res) => {
    try {
        const { email } = req.params;
        const doctorId = req.user._id;

        // Verify doctor has seen this patient before or has access
        const hasAccess = await Appointment.findOne({ doctor: doctorId, patientEmail: email });
        if (!hasAccess) {
            // In a real hospital, doctors can only see their own consults unless they are in a specific team.
            // Following the restriction: "Doctor can only access patients assigned to them"
            return res.status(403).json({ success: false, message: "No clearance to view this patient's history." });
        }

        const appointments = await Appointment.find({ patientEmail: email }).sort({ date: -1 });
        const prescriptions = await WrittenPrescription.find({ 'patientDetails.phone': hasAccess.phone || email }).sort({ createdAt: -1 });
        // NOTE: In a real app, linking by email is safer.
        // Let's search prescriptions by patientId if available, or email.
        const allPrescriptions = await WrittenPrescription.find({ 
            $or: [
                { 'patientDetails.email': email },
                { 'patientDetails.phone': hasAccess.patientPhone } // assuming phone exists in apt
            ]
        }).populate('doctorId', 'name specialty').sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                appointments,
                prescriptions: allPrescriptions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new prescription
// @route   POST /api/doctors/prescriptions
// @access  Private
const createPrescription = async (req, res) => {
    try {
        const { patientId, appointmentId, patientDetails, diagnosis, medicines, notes, vitals, followUpDays } = req.body;
        const doctorId = req.user._id;

        const prescription = await WrittenPrescription.create({
            patientId: patientId || undefined,
            doctorId,
            appointmentId: appointmentId || undefined,
            patientDetails: { ...patientDetails, followUpDays },
            diagnosis,
            medicines,
            notes,
            vitals,
            status: 'finalized'
        });

        res.status(201).json({ success: true, data: prescription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all prescriptions created by this doctor
// @route   GET /api/doctors/my-prescriptions
// @access  Private
const getMyPrescriptions = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const prescriptions = await WrittenPrescription.find({ doctorId }).sort({ createdAt: -1 });
        res.json({ success: true, count: prescriptions.length, data: prescriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDoctors,
    authDoctor,
    registerDoctor,
    getDoctorProfile,
    getDoctorPatients,
    getPatientHistory,
    createPrescription,
    getMyPrescriptions
};
