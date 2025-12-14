const Otp = require('../models/otpModel');
const Customer = require('../models/customerModel');
const { sendOtpEmail } = require('../utils/emailService');
const crypto = require('crypto');

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
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Delete any existing OTPs for this email to ensure only one valid OTP exists
        await Otp.deleteMany({ email });

        const otp = generateOtp();

        // Create new OTP
        await Otp.create({
            email,
            otp
        });

        // Send Email
        const emailSent = await sendOtpEmail(email, otp);

        if (!emailSent) {
            // Build redundancy?
            // return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
            // For now, return error
            throw new Error('Failed to send OTP email');
        }

        res.status(200).json({
            success: true,
            message: `OTP sent successfully to ${email}`
        });

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error sending OTP'
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
            // token: generateToken(user.id) // If we had JWT setup for customers
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

module.exports = {
    sendOtp,
    verifyOtp,
    updateProfile
};
