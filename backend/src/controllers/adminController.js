const Admin = require('../models/adminModel');
const Customer = require('../models/customerModel');
const Doctor = require('../models/doctorModel');
const Order = require('../models/orderModel');
const Otp = require('../models/otpModel');
const { sendOtpEmail } = require('../utils/emailService');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken'); // Assuming you have this utility

// Generate 6-digit OTP
const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// @desc    Auth Admin & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const userCount = await Customer.countDocuments({});
        const doctorCount = await Doctor.countDocuments({});
        const orderCount = await Order.countDocuments({});
        const pendingDoctors = await Doctor.countDocuments({ isApproved: false });

        res.json({
            users: userCount,
            doctors: doctorCount,
            orders: orderCount,
            pendingDoctors
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await Customer.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve a doctor
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private/Admin
const approveDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (doctor) {
            doctor.isApproved = true;
            const updatedDoctor = await doctor.save();
            res.json(updatedDoctor);
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send Admin OTP
// @route   POST /api/admin/send-otp
// @access  Public
const sendAdminOtp = async (req, res) => {
    const { email } = req.body;

    // Allow strict @gmail.com or existing admins
    if (!email.endsWith('@gmail.com')) {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Only @gmail.com or registered admins allowed' });
        }
    }

    await Otp.deleteMany({ email });
    const otp = generateOtp();
    await Otp.create({ email, otp });
    console.log('CONTROLLER_OTP:', otp);

    const emailSent = await sendOtpEmail(email, otp);
    if (emailSent) {
        res.json({ message: 'OTP sent successfully', devOtp: otp });
    } else {
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

// @desc    Verify Admin OTP
// @route   POST /api/admin/verify-otp
// @access  Public
const verifyAdminOtp = async (req, res) => {
    const { email, otp } = req.body;

    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
        return res.status(400).json({ message: 'Invalid or Expired OTP' });
    }

    await Otp.deleteOne({ _id: validOtp._id });

    let admin = await Admin.findOne({ email });

    if (!admin) {
        // JIT Provisioning for Gmail users
        if (email.endsWith('@gmail.com')) {
            admin = await Admin.create({
                email,
                password: crypto.randomBytes(16).toString('hex') // Dummy password
            });
        } else {
            return res.status(404).json({ message: 'Admin not found' });
        }
    }

    res.json({
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
    });
};

// @desc    Register a new Admin (Seeding purpose mainly)
// @route   POST /api/admin/register
// @access  Public (Should be protected or removed in prod)
const registerAdmin = async (req, res) => {
    const { email, password } = req.body;
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
        return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({
        email,
        password
    });

    if (admin) {
        res.status(201).json({
            _id: admin._id,
            email: admin.email,
            token: generateToken(admin._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid admin data' });
    }
};


module.exports = {
    authAdmin,
    getDashboardStats,
    getAllUsers,
    getAllDoctors,
    approveDoctor,
    registerAdmin,
    sendAdminOtp,
    verifyAdminOtp
};
