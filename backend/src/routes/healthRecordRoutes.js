const express = require('express');
const router = express.Router();
const healthRecordController = require('../controllers/healthRecordController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Ensure user is authenticated

router.route('/')
    .get(healthRecordController.getRecords)
    .post(healthRecordController.createRecord);

router.post('/sync', healthRecordController.syncRecords);

module.exports = router;
