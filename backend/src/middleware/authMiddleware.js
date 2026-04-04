const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');
const Admin = require('../models/adminModel');
const Doctor = require('../models/doctorModel');
const Pharmacist = require('../models/Pharmacist');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            // Try Customer
            req.user = await Customer.findById(decoded.id).select('-password');
            
            if (!req.user) {
                // Try Doctor
                req.user = await Doctor.findById(decoded.id).select('-password');
            }

            if (!req.user) {
                // Try Admin
                req.user = await Admin.findById(decoded.id).select('-password');
            }

            if (!req.user) {
                // Try Pharmacist
                req.user = await Pharmacist.findById(decoded.id).select('-password');
            }

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
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

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user ? req.user.role : 'none'} is not authorized to access this route`
            });
        }
        next();
    };
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, authorize, admin };
