const Medicine = require('../models/Medicine');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
exports.getMedicines = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const startIndex = (page - 1) * limit;
        const total = await Medicine.countDocuments(query);

        const medicines = await Medicine.find(query)
            .sort({ name: 1 })
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
        const medicine = await Medicine.findById(req.params.id);

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
