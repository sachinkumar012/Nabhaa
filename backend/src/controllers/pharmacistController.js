const Pharmacist = require('../models/Pharmacist');
const Order = require('../models/orderModel');
const Medicine = require('../models/Medicine');
const LabTest = require('../models/labTestModel');
const LabBooking = require('../models/labBookingModel');
const jwt = require('jsonwebtoken');
const Otp = require('../models/otpModel');
const { sendOtpEmail } = require('../utils/emailService');
const crypto = require('crypto');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '7d',
    });
};

// Generate 6-digit OTP
const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * @desc    Register a new pharmacist
 * @route   POST /api/pharmacist/register
 * @access  Public
 */
const registerPharmacist = async (req, res) => {
    try {
        const { name, pharmacyName, email, password, phone, address, licenseNumber } = req.body;

        const pharmacistExists = await Pharmacist.findOne({ email });
        if (pharmacistExists) {
            return res.status(400).json({ success: false, message: 'Pharmacist already exists' });
        }

        const pharmacist = await Pharmacist.create({
            name,
            pharmacyName,
            email,
            password,
            phone,
            address,
            licenseNumber
        });

        if (pharmacist) {
            res.status(201).json({
                success: true,
                user: {
                    _id: pharmacist._id,
                    name: pharmacist.name,
                    email: pharmacist.email,
                    role: 'pharmacist',
                    pharmacyName: pharmacist.pharmacyName
                },
                token: generateToken(pharmacist._id)
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid pharmacist data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Login pharmacist
 * @route   POST /api/pharmacist/login
 * @access  Public
 */
const loginPharmacist = async (req, res) => {
    try {
        const { email, password } = req.body;

        const pharmacist = await Pharmacist.findOne({ email }).select('+password');

        if (pharmacist && (await pharmacist.matchPassword(password))) {
            if (pharmacist.verificationStatus !== 'Approved') {
                return res.status(403).json({ 
                    success: false, 
                    message: `Account is ${pharmacist.verificationStatus.toLowerCase()}. Please wait for admin approval.` 
                });
            }

            res.json({
                success: true,
                user: {
                    _id: pharmacist._id,
                    name: pharmacist.name,
                    email: pharmacist.email,
                    role: 'pharmacist',
                    pharmacyName: pharmacist.pharmacyName,
                    verificationStatus: pharmacist.verificationStatus
                },
                token: generateToken(pharmacist._id)
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Send OTP to pharmacist email
 * @route   POST /api/pharmacist/send-otp
 * @access  Public
 */
const sendPharmacistOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const pharmacist = await Pharmacist.findOne({ email });
        
        if (!pharmacist) {
            return res.status(404).json({ success: false, message: 'Pharmacist not found with this email' });
        }

        await Otp.deleteMany({ email });
        const otp = generateOtp();
        await Otp.create({ email, otp });
        const emailSent = await sendOtpEmail(email, otp);

        if (!emailSent) {
            throw new Error('Failed to send OTP email');
        }

        res.status(200).json({ success: true, message: `OTP sent to ${email}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Verify OTP for pharmacist
 * @route   POST /api/pharmacist/verify-otp
 * @access  Public
 */
const verifyPharmacistOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const validOtp = await Otp.findOne({ email, otp });

        if (!validOtp) {
            return res.status(400).json({ success: false, message: 'Invalid or Expired OTP' });
        }

        await Otp.deleteOne({ _id: validOtp._id });
        const pharmacist = await Pharmacist.findOne({ email });

        res.status(200).json({
            success: true,
            user: {
                _id: pharmacist._id,
                name: pharmacist.name,
                email: pharmacist.email,
                role: 'pharmacist',
                pharmacyName: pharmacist.pharmacyName
            },
            token: generateToken(pharmacist._id)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get pharmacist profile
 * @route   GET /api/pharmacist/profile
 * @access  Private
 */
const getPharmacistProfile = async (req, res) => {
    try {
        const pharmacist = await Pharmacist.findById(req.user._id);
        if (pharmacist) {
            res.json({ success: true, user: pharmacist });
        } else {
            res.status(404).json({ success: false, message: 'Pharmacist not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update pharmacist profile
 * @route   PUT /api/pharmacist/profile
 * @access  Private
 */
const updatePharmacistProfile = async (req, res) => {
    try {
        const pharmacist = await Pharmacist.findById(req.user._id);

        if (pharmacist) {
            pharmacist.name = req.body.name || pharmacist.name;
            pharmacist.pharmacyName = req.body.pharmacyName || pharmacist.pharmacyName;
            pharmacist.phone = req.body.phone || pharmacist.phone;
            pharmacist.address = req.body.address || pharmacist.address;
            if (req.body.password) {
                pharmacist.password = req.body.password;
            }
            if (req.body.profileImage) {
                pharmacist.profileImage = req.body.profileImage;
            }

            const updatedPharmacist = await pharmacist.save();
            res.json({
                success: true,
                user: {
                    _id: updatedPharmacist._id,
                    name: updatedPharmacist.name,
                    email: updatedPharmacist.email,
                    role: 'pharmacist',
                    pharmacyName: updatedPharmacist.pharmacyName
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'Pharmacist not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get pharmacist dashboard analytics
 * @route   GET /api/pharmacist/analytics
 * @access  Private
 */
const getDashboardAnalytics = async (req, res) => {
    try {
        const pId = req.user._id;
        const now = new Date();
        const startOfToday = new Date(new Date(now).setHours(0, 0, 0, 0));
        const startOfYesterday = new Date(new Date(startOfToday).getTime() - 24 * 60 * 60 * 1000);
        const startOfThisWeek = new Date(new Date(startOfToday).getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfLastWeek = new Date(new Date(startOfThisWeek).getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfThisYear = new Date(now.getFullYear(), 0, 1);
        const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);

        // Helper for revenue aggregation
        const getRevenue = async (start, end) => {
            const result = await Order.aggregate([
                { 
                    $match: { 
                        pharmacist: pId, 
                        isPaid: true, 
                        createdAt: { $gte: start, $lt: end || new Date(now.getTime() + 1000) } 
                    } 
                },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ]);
            return result[0]?.total || 0;
        };

        const [
            todayRev, yesterdayRev,
            thisWeekRev, lastWeekRev,
            thisMonthRev, lastMonthRev,
            thisYearRev, lastYearRev
        ] = await Promise.all([
            getRevenue(startOfToday), getRevenue(startOfYesterday, startOfToday),
            getRevenue(startOfThisWeek), getRevenue(startOfLastWeek, startOfThisWeek),
            getRevenue(startOfThisMonth), getRevenue(startOfLastMonth, startOfThisMonth),
            getRevenue(startOfThisYear), getRevenue(startOfLastYear, startOfThisYear)
        ]);

        const calcGrowth = (curr, prev) => prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

        // Order Status Distribution
        const orderStatsArr = await Order.aggregate([
            { $match: { pharmacist: pId } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const orderStats = orderStatsArr.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        // Top Selling Medicines
        const topMedicines = await Order.aggregate([
            { $match: { pharmacist: pId, isPaid: true } },
            { $unwind: "$orderItems" },
            { $group: { 
                _id: "$orderItems.name", 
                units: { $sum: "$orderItems.qty" }, 
                revenue: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } } 
            } },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);

        // Lab Test Analytics
        const labStats = await LabBooking.aggregate([
            { $match: { pharmacist: pId } },
            { $lookup: { from: 'labtests', localField: 'test', foreignField: '_id', as: 'testDetails' } },
            { $unwind: "$testDetails" },
            { $group: { 
                _id: "$testDetails.title", 
                bookings: { $sum: 1 }, 
                revenue: { $sum: "$testDetails.price" } 
            } },
            { $sort: { bookings: -1 } },
            { $limit: 5 }
        ]);

        // Trend Data for Charts
        const getTrendData = async (days) => {
            const startDate = new Date(new Date(startOfToday).getTime() - days * 24 * 60 * 60 * 1000);
            const results = await Order.aggregate([
                { $match: { pharmacist: pId, isPaid: true, createdAt: { $gte: startDate } } },
                { $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" },
                    orders: { $sum: 1 }
                } },
                { $sort: { "_id": 1 } }
            ]);
            return results;
        };

        const dailyTrends = await getTrendData(30);

        // Compatibility with Dashboard.jsx
        const totalOrders = await Order.countDocuments({ pharmacist: pId });
        const pendingOrders = orderStats['Pending'] || 0;
        const completedOrders = orderStats['Delivered'] || 0;
        const totalSales = await getRevenue(new Date(0)); // All time

        res.json({
            success: true,
            analytics: {
                totalOrders,
                pendingOrders,
                completedOrders,
                totalSales,
                revenueOverview: {
                    daily: { value: todayRev, growth: calcGrowth(todayRev, yesterdayRev) },
                    weekly: { value: thisWeekRev, growth: calcGrowth(thisWeekRev, lastWeekRev) },
                    monthly: { value: thisMonthRev, growth: calcGrowth(thisMonthRev, lastMonthRev) },
                    yearly: { value: thisYearRev, growth: calcGrowth(thisYearRev, lastYearRev) }
                },
                orderStats: orderStatsArr.map(s => ({ name: s._id, value: s.count })),
                topMedicines: topMedicines.map(m => ({ name: m._id, units: m.units, revenue: m.revenue })),
                labStats: labStats.map(l => ({ name: l._id, bookings: l.bookings, revenue: l.revenue })),
                trends: {
                    daily: dailyTrends
                }
            }
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerPharmacist,
    loginPharmacist,
    sendPharmacistOtp,
    verifyPharmacistOtp,
    getPharmacistProfile,
    updatePharmacistProfile,
    getDashboardAnalytics
};
