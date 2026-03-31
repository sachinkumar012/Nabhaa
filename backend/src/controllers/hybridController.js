const HybridDrugService = require('../services/hybridDrugService');
const Medicine = require('../models/Medicine');

/**
 * @desc    Search medicine using DB -> RxNorm fallback
 * @route   GET /api/prescriptions/search?name=paracetamol
 * @access  Public
 */
exports.searchMedicine = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ safe: false, warning: "Please provide a medicine name" });

        const result = await HybridDrugService.searchMedicine(name);
        
        if (result.source === 'not_found') {
             return res.status(404).json({
                 source: "rxnorm",
                 original: null,
                 substitutes: [],
                 safety: { safe: true, warning: 'Drug completely unrecognized across DB and RxNorm.' }
             });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Hybrid Search Error:', error);
        res.status(500).json({ safe: false, warning: error.message });
    }
};

/**
 * @desc    Add new medicine directly to Internal MongoDB
 * @route   POST /api/prescriptions/medicine
 * @access  Private
 */
exports.addMedicine = async (req, res) => {
    try {
        const { name, composition, packSize, type, manufacturer, price, isDiscontinued } = req.body;
        
        if (!name || !composition) return res.status(400).json({ error: "Name and composition required" });

        const newMed = await Medicine.create({
            name,
            composition,
            packSize,
            type,
            manufacturer,
            price,
            isDiscontinued: isDiscontinued || false
        });

        res.status(201).json({ success: true, data: newMed });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get all alternatives for a specific salt generic string
 * @route   GET /api/prescriptions/substitutes/:salt
 * @access  Public
 */
exports.getSubstitutes = async (req, res) => {
    try {
        const { salt } = req.params;
        const substitutes = await HybridDrugService.getSubstitutesBySalt(salt);
        
        res.status(200).json({
            salt: salt,
            count: substitutes.length,
            substitutes
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
