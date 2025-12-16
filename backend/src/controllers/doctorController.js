const Doctor = require('../models/doctorModel');
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
        // req.user is already the doctor document (or generic object matching schema) populated by protect middleware
        // But let's be safe and fetch it again or just use it.
        // Actually, since protect middleware puts the WHOLE document in req.user, we might not need to query again if we trust it.
        // But existing code queries it. Let's keep it but handle error.

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

module.exports = {
    getDoctors,
    authDoctor,
    registerDoctor,
    getDoctorProfile
};
