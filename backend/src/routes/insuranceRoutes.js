const express = require('express');
const router = express.Router();
const { purchaseInsurance, downloadCard } = require('../controllers/insuranceController');

// Define routes
router.post('/purchase', purchaseInsurance);
router.get('/card/:id', downloadCard);

module.exports = router;
