const express = require('express');
const router = express.Router();
const { getMedicines, getMedicineById } = require('../controllers/medicineController');

router.get('/', getMedicines);
router.get('/:id', getMedicineById);

module.exports = router;
