const Insurance = require('../models/Insurance');
const { generateInsuranceCardPDF } = require('../utils/pdfGenerator');
const { sendInsuranceConfirmation } = require('../utils/emailService');

// @desc    Purchase new insurance policy
// @route   POST /api/insurance/purchase
// @access  Public
const purchaseInsurance = async (req, res) => {
    try {
        const { userId, name, email, phone, dob, planId, planName, premiumPaid, coverage, paymentMethod, transactionId } = req.body;

        // Validation
        if (!name || !email || !phone || !dob || !planName || !premiumPaid || !coverage || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Generate unique policy number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const policyNumber = `POL-${dateStr}-${randomNum}`;

        // Valid Till is 1 year from now
        const validTill = new Date();
        validTill.setFullYear(validTill.getFullYear() + 1);

        // Create policy in DB
        const insurance = await Insurance.create({
            userId: userId || null,
            name,
            email,
            phone,
            dob,
            planId,
            planName,
            coverage,
            premiumPaid,
            policyNumber,
            validTill,
            paymentDetails: {
                method: paymentMethod,
                transactionId: transactionId || 'COD',
                amount: premiumPaid,
                status: 'Paid'
            }
        });

        // Generate PDF
        const policyDetails = {
            name: insurance.name,
            policyNumber: insurance.policyNumber,
            planName: insurance.planName,
            coverage: insurance.coverage,
            premiumPaid: insurance.premiumPaid,
            validTill: insurance.validTill,
            dob: insurance.dob
        };

        const pdfBuffer = await generateInsuranceCardPDF(policyDetails);

        // Send Email
        await sendInsuranceConfirmation(insurance.email, policyDetails, pdfBuffer);

        res.status(201).json({
            success: true,
            message: 'Insurance purchased successfully',
            policyId: insurance._id,
            policyNumber: insurance.policyNumber
        });

    } catch (error) {
        console.error('Error purchasing insurance:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Download Insurance PDF Card
// @route   GET /api/insurance/card/:id
// @access  Public
const downloadCard = async (req, res) => {
    try {
        const insurance = await Insurance.findById(req.params.id);
        if (!insurance) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }

        const policyDetails = {
            name: insurance.name,
            policyNumber: insurance.policyNumber,
            planName: insurance.planName,
            coverage: insurance.coverage,
            premiumPaid: insurance.premiumPaid,
            validTill: insurance.validTill,
            dob: insurance.dob
        };

        const pdfBuffer = await generateInsuranceCardPDF(policyDetails);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Nabha_Insurance_Card_${insurance.policyNumber}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ success: false, message: 'Server Error generating PDF' });
    }
};

module.exports = {
    purchaseInsurance,
    downloadCard
};
