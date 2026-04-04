const Medicine = require('../models/Medicine');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
exports.getMedicines = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const sort = req.query.sort || 'default';

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { salt: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
            ];
        }

        if (category && category !== 'all') {
            query.category = { $regex: category, $options: 'i' };
        }

        let sortQuery = { name: 1 };
        if (sort === 'price_asc') sortQuery = { price: 1 };
        if (sort === 'price_desc') sortQuery = { price: -1 };
        if (sort === 'name_asc') sortQuery = { name: 1 };
        if (sort === 'discount') sortQuery = { discount: -1 };

        const startIndex = (page - 1) * limit;
        const total = await Medicine.countDocuments(query);

        const medicines = await Medicine.find(query)
            .sort(sortQuery)
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: medicines.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            data: medicines
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Public
exports.getMedicineById = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id).populate('pharmacist', 'name pharmacyName');

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
        }

        res.status(200).json({
            success: true,
            data: medicine
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// --- PHARMACIST SPECIFIC METHODS ---

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private (Pharmacist)
exports.createMedicine = async (req, res) => {
    try {
        req.body.pharmacist = req.user._id;
        const medicine = await Medicine.create(req.body);

        res.status(201).json({
            success: true,
            data: medicine
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: err.message || 'Error creating medicine'
        });
    }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (Pharmacist)
exports.updateMedicine = async (req, res) => {
    try {
        let medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        // Make sure user is medicine owner
        if (medicine.pharmacist.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this medicine' });
        }

        medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: medicine
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Pharmacist)
exports.deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        // Make sure user is medicine owner
        if (medicine.pharmacist.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this medicine' });
        }

        await medicine.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Bulk upload medicines
// @route   POST /api/medicines/bulk
// @access  Private (Pharmacist)
exports.bulkUploadMedicines = async (req, res) => {
    try {
        const medicines = req.body.medicines.map(med => ({
            ...med,
            pharmacist: req.user._id
        }));

        const result = await Medicine.insertMany(medicines);

        res.status(201).json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get all medicines for a pharmacist
// @route   GET /api/medicines/my-medicines
// @access  Private (Pharmacist)
exports.getPharmacistMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find({ pharmacist: req.user._id });

        res.status(200).json({
            success: true,
            count: medicines.length,
            data: medicines
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
