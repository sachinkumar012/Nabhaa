const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');
const Admin = require('../models/adminModel');
const Doctor = require('../models/doctorModel');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            // Check if user is admin, doctor or customer
            // This is a bit tricky since we have 3 collections. 
            // For now, let's try to find in all 3 or rely on decoded role if we added it to token (we only added id)
            // But usually 'protect' is for customers. Let's make it generic or split.

            console.log("Protect Middleware - Decoded:", decoded);

            // Try Customer First
            req.user = await Customer.findById(decoded.id).select('-password');
            if (req.user) console.log("User found as Customer");

            if (!req.user) {
                // Try Doctor
                req.user = await Doctor.findById(decoded.id).select('-password');
                if (req.user) console.log("User found as Doctor");
            }

            if (!req.user) {
                // Try Admin
                req.user = await Admin.findById(decoded.id).select('-password');
                if (req.user) console.log("User found as Admin");
            }

            if (!req.user) {
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
