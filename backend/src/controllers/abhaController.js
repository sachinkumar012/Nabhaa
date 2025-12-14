const generateOtp = async (req, res) => {
    try {
        const { mobile, aadhaar } = req.body;
        // In a real scenario, call ABDM API
        console.log(`Generating OTP for: ${mobile || aadhaar}`);

        // Mock response
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your registered mobile number.',
            transactionId: 'txn_' + Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate OTP',
            error: error.message
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { otp, transactionId } = req.body;

        // Mock validation
        if (otp === '123456') {
            res.status(200).json({
                success: true,
                message: 'OTP verified successfully.',
                tempToken: 'token_' + Date.now()
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please try again (Use 123456).'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message
        });
    }
};

const createAbha = async (req, res) => {
    try {
        const { tempToken, aadhaar, address, dob, gender, image, name } = req.body;

        // Mock creation - Echoing back user details
        res.status(201).json({
            success: true,
            message: 'ABHA ID created successfully.',
            data: {
                abhaNumber: '12-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
                abhaAddress: (name ? name.toLowerCase().replace(/\s/g, '') : 'user') + '@abdm',
                name: name || 'Sachin Kumar',
                gender: gender || 'Male',
                dob: dob || '1995-05-15',
                address: address || 'Nabha, Punjab',
                aadhaar: aadhaar || 'XXXX-XXXX-XXXX',
                image: image || null, // Expecting Base64 or URL
                status: 'active'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create ABHA ID',
            error: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        // Mock profile fetch
        res.status(200).json({
            success: true,
            data: {
                abhaNumber: '12-3456-7890-1234',
                abhaAddress: 'user@abdm',
                name: 'Sachin Kumar',
                gender: 'Male',
                mobile: '9876543210',
                dob: '1995-05-15',
                kycStatus: 'verified'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};

module.exports = {
    generateOtp,
    verifyOtp,
    createAbha,
    getProfile
};
