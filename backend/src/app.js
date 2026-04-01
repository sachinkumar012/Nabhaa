const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// CORS — allow localhost dev + production Render/Vercel/Netlify URLs
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    ...(process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        : []),
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, server-to-server, curl)
        if (!origin) return callback(null, true);
        // Allow if origin is in allowlist OR is a render/vercel/netlify domain
        if (
            allowedOrigins.includes(origin) ||
            /\.onrender\.com$/.test(origin) ||
            /\.vercel\.app$/.test(origin) ||
            /\.netlify\.app$/.test(origin)
        ) {
            return callback(null, true);
        }
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate Limiting
app.set('trust proxy', 1); // Trust first proxy (Render/Heroku)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
    res.send('Nabha Healthcare API is running... (v2 - Debug Mode)');
});

const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const abhaRoutes = require('./routes/abhaRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');

app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/abha', abhaRoutes);
app.use('/api/auth', authRoutes);
console.log('Mounting /api/admin routes');
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/lab-tests', require('./routes/labRoutes'));
app.use('/api/prescriptions', prescriptionRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

module.exports = app;
