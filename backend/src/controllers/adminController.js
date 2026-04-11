const Admin = require('../models/adminModel');
const Customer = require('../models/customerModel');
const Doctor = require('../models/doctorModel');
const Order = require('../models/orderModel');
const Pharmacist = require('../models/Pharmacist');
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
        const activePartnersCount = await Pharmacist.countDocuments({ verificationStatus: 'Approved' });
        
        const now = new Date();
        const startOfToday = new Date(new Date(now).setHours(0, 0, 0, 0));
        const startOfThisWeek = new Date(new Date(startOfToday).getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfThisYear = new Date(now.getFullYear(), 0, 1);

        const getRevenue = async (start) => {
            const result = await Order.aggregate([
                { $match: { isPaid: true, createdAt: { $gte: start } } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ]);
            return result[0]?.total || 0;
        };

        const [dailyRev, weeklyRev, monthlyRev, yearlyRev, totalRev] = await Promise.all([
            getRevenue(startOfToday), getRevenue(startOfThisWeek),
            getRevenue(startOfThisMonth), getRevenue(startOfThisYear),
            getRevenue(new Date(0))
        ]);

        // category distribution (dummy if no category exists, else use source)
        const categories = await Order.aggregate([
            { $unwind: "$orderItems" },
            { $group: { _id: "$orderItems.source", count: { $sum: 1 } } }
        ]);

        // Daily orders chart data (last 7 days)
        const dailyTrends = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfThisWeek } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                orders: { $sum: 1 },
                revenue: { $sum: "$totalPrice" }
            } },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            users: userCount,
            doctors: doctorCount,
            orders: orderCount,
            activePartners: activePartnersCount,
            revenue: {
                daily: dailyRev,
                weekly: weeklyRev,
                monthly: monthlyRev,
                yearly: yearlyRev,
                total: totalRev
            },
            charts: {
                paymentDistribution: categories,
                dailyTrends
            }
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


// ---- NEW SAAS SYSTEM ENDPOINTS ---- //

// @desc    Update user status (block/unblock)
// @route   PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
    try {
        const user = await Customer.findById(req.params.id);
        if (user) {
            user.status = req.body.status; // 'active' or 'blocked'
            await user.save();
            res.json({ success: true, message: `User status updated to ${user.status}` });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all pharmacists (Partners)
// @route   GET /api/admin/pharmacists
const getAllPharmacists = async (req, res) => {
    try {
        const pharmacists = await Pharmacist.find({}).sort({ createdAt: -1 });
        res.json(pharmacists);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update pharmacist approval status
// @route   PUT /api/admin/pharmacists/:id/status
const updatePharmacistStatus = async (req, res) => {
    try {
        const pharmacist = await Pharmacist.findById(req.params.id);
        if (pharmacist) {
            pharmacist.verificationStatus = req.body.status; // 'Pending', 'Approved', 'Rejected'
            await pharmacist.save();
            res.json({ success: true, message: `Pharmacist status updated to ${req.body.status}` });
        } else {
            res.status(404).json({ success: false, message: 'Pharmacist not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .populate('pharmacist', 'pharmacyName name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create doctor manually
// @route   POST /api/admin/doctors
const createDoctor = async (req, res) => {
    try {
        const { name, email, password, specialty, experience, location } = req.body;
        const doctorExists = await Doctor.findOne({ email });
        
        if (doctorExists) {
            return res.status(400).json({ success: false, message: 'Doctor already exists' });
        }

        const doctor = await Doctor.create({
            name,
            email,
            password,
            specialty,
            experience,
            location,
            isApproved: true // Admin created doctors are auto-approved
        });

        res.status(201).json({ success: true, message: 'Doctor created successfully', data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
    verifyAdminOtp,
    updateUserStatus,
    getAllPharmacists,
    updatePharmacistStatus,
    getAllOrders,
    createDoctor
};
