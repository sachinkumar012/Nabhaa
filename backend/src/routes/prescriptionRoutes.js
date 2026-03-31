const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzePrescription, validateMedicine } = require('../controllers/prescriptionController');
const { searchMedicine, addMedicine, getSubstitutes } = require('../controllers/hybridController');

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB (up from 5MB for high-res prescriptions)
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP, TIFF) are accepted for prescription upload.'), false);
    }
  },
});

// ─── Primary OCR Analysis Endpoint ────────────────────────────────────────
router.post('/analyze', upload.single('prescription'), analyzePrescription);

// ─── Manual input / fuzzy-search fallback ─────────────────────────────────
// GET /api/prescriptions/validate-medicine?q=calpol
router.get('/validate-medicine', validateMedicine);

// ─── Hybrid Drug Search Endpoints ─────────────────────────────────────────
router.get('/search', searchMedicine);
router.post('/medicine', addMedicine);
router.get('/substitutes/:salt', getSubstitutes);

module.exports = router;
