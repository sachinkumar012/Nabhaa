const Otp = require('../models/otpModel');
const Customer = require('../models/customerModel');
const { sendOtpEmail } = require('../utils/emailService');
const { sendOtpSms } = require('../utils/smsService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '7d', // 7 days
    });
};

// Generate 6-digit OTP
const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * @desc    Send OTP to email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtp = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ success: false, message: 'Email or Phone Number is required' });
        }

        const identifier = email || phone;
        const isEmail = !!email;

        // Delete any existing OTPs for this identifier to ensure only one valid OTP exists
        await Otp.deleteMany({ email: identifier });

        const otp = generateOtp();

        // Create new OTP
        await Otp.create({
            email: identifier,
            otp
        });

        let deliverySuccess = false;
        let errorMessage = '';

        if (isEmail) {
            try {
                deliverySuccess = await sendOtpEmail(email, otp);
            } catch (err) {
                console.error('[AUTH] Email sending failed:', err.message);
                errorMessage = err.message;
            }
        } else if (phone) {
            deliverySuccess = await sendOtpSms(phone, otp);
            if (!deliverySuccess) errorMessage = 'SMS delivery failed';
        }

        if (!deliverySuccess) {
            await Otp.deleteMany({ email: identifier });

            if (
                errorMessage.includes('not configured for production') ||
                errorMessage.includes('Email is not configured')
            ) {
                return res.status(503).json({
                    success: false,
                    message: errorMessage,
                    code: 'EMAIL_NOT_CONFIGURED',
                });
            }

            if (errorMessage.includes('configuration missing')) {
                return res.status(503).json({
                    success: false,
                    message:
                        'SMTP is not configured. For local development add SMTP_USER and SMTP_PASS to backend/.env.',
                    code: 'SMTP_NOT_CONFIGURED',
                });
            }

            return res.status(503).json({
                success: false,
                message: `Failed to send OTP. ${errorMessage || 'Please try again later.'}`,
                code: 'EMAIL_DELIVERY_FAILED',
            });
        }

        res.status(200).json({
            success: true,
            message: `OTP sent successfully to ${identifier}`
        });

    } catch (error) {
        console.error('-------------------------------------------');
        console.error('FATAL SEND-OTP ERROR:', {
            message: error.message,
            stack: error.stack
        });
        console.error('-------------------------------------------');
        
        res.status(500).json({
            success: false,
            message: `Internal Server Error: ${error.message || 'Failed to process request'}`,
        });
    }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        // Check if OTP exists
        const validOtp = await Otp.findOne({ email, otp });

        if (!validOtp) {
            return res.status(400).json({ success: false, message: 'Invalid or Expired OTP' });
        }

        // OTP is valid. Delete it.
        await Otp.deleteOne({ _id: validOtp._id });

        // Find or create customer
        let customer = await Customer.findOne({ email });

        if (!customer) {
            customer = await Customer.create({
                email,
                name: email.split('@')[0]
            });
        }

        const user = customer;

        res.status(200).json({
            success: true,
            message: 'OTP Verified Successfully',
            user,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error verifying OTP'
        });
    }
};

/**
 * @desc    Update Customer Profile
 * @route   PUT /api/auth/profile
 * @access  Public (should be protected in prod)
 */
const updateProfile = async (req, res) => {
    try {
        const { email, ...updateData } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email identifier required' });
        }

        const updatedCustomer = await Customer.findOneAndUpdate(
            { email },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedCustomer
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error updating profile'
        });
    }
};

/**
 * @desc    Get Current Customer Profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server Error getting profile' });
    }
};

module.exports = {
    sendOtp,
    verifyOtp,
    updateProfile,
    getProfile
};
