const mongoose = require('mongoose');
const Pharmacist = require('./src/models/Pharmacist');
const dotenv = require('dotenv');

dotenv.config();

async function testUpdate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const pharmacist = await Pharmacist.findOne({ verificationStatus: 'Pending' });
        if (!pharmacist) {
            console.log('No pending pharmacist found to test');
            process.exit(0);
        }

        console.log('Found pharmacist:', pharmacist._id);
        pharmacist.verificationStatus = 'Approved';
        
        console.log('Attempting to save...');
        await pharmacist.save();
        console.log('Save successful!');
        
        process.exit(0);
    } catch (error) {
        console.error('ERROR DURING SAVE:', error);
        process.exit(1);
    }
}

testUpdate();
