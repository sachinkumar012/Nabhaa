const express = require('express');
const router = express.Router();
const { 
    getMedicines, 
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    bulkUploadMedicines,
    getPharmacistMedicines
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getMedicines);
router.get('/my-medicines', protect, authorize('pharmacist'), getPharmacistMedicines);
router.get('/:id', getMedicineById);

// Protected Pharmacist Routes
router.post('/', protect, authorize('pharmacist'), createMedicine);
router.post('/bulk', protect, authorize('pharmacist'), bulkUploadMedicines);
router.put('/:id', protect, authorize('pharmacist'), updateMedicine);
router.delete('/:id', protect, authorize('pharmacist'), deleteMedicine);

module.exports = router;
