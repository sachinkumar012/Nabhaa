const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzePrescription, validateMedicine } = require('../controllers/prescriptionController');
const { searchMedicine, addMedicine, getSubstitutes } = require('../controllers/hybridController');

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB — mobile camera RAW can be large
  fileFilter: (req, file, cb) => {
    // Accept all common image formats, including mobile-specific ones
    const allowed = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/tiff',
      'image/bmp',
      'image/heic',   // iOS HEIC format
      'image/heif',   // iOS HEIF format
      'image/avif',   // Modern mobile format
    ];
    // Some mobile browsers report wrong MIME; allow by extension as fallback
    const filename = file.originalname?.toLowerCase() || '';
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.tiff', '.tif', '.bmp', '.avif'];
    const extOk = allowedExts.some(ext => filename.endsWith(ext));

    if (allowed.includes(file.mimetype) || extOk) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Please use JPG, PNG, WebP, or HEIC.`), false);
    }
  },
});

// ─── Primary OCR Analysis Endpoint ────────────────────────────────────────
// Wrap with multer error handler to return clean JSON on upload errors
router.post('/analyze', (req, res, next) => {
  upload.single('prescription')(req, res, (err) => {
    if (err) {
      console.error('[Route] Multer upload error:', err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          code: 'FILE_TOO_LARGE',
          message: 'Image is too large. Maximum size is 25 MB. Please compress or resize the image.',
        });
      }
      return res.status(400).json({
        success: false,
        code: 'UPLOAD_ERROR',
        message: err.message || 'File upload failed.',
      });
    }
    next();
  });
}, analyzePrescription);

// ─── Manual input / fuzzy-search fallback ─────────────────────────────────
// GET /api/prescriptions/validate-medicine?q=calpol
router.get('/validate-medicine', validateMedicine);

// ─── Hybrid Drug Search Endpoints ─────────────────────────────────────────
router.get('/search', searchMedicine);
router.post('/medicine', addMedicine);
router.get('/substitutes/:salt', getSubstitutes);

module.exports = router;
