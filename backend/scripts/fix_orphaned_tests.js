require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const LabTest = require('../models/labTestModel');
const Pharmacist = require('../models/Pharmacist');

const fixOrphanedDocs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nabhaa');
        console.log('Connected to MongoDB');

        const pharmacist = await Pharmacist.findOne();
        if (!pharmacist) {
            console.error('No pharmacist found in database. Please register a pharmacist first.');
            process.exit(1);
        }

        console.log(`Using Pharmacist: ${pharmacist.name} (${pharmacist._id})`);

        const orphaned = await LabTest.find({ pharmacist: { $exists: false } });
        console.log(`Found ${orphaned.length} orphaned lab tests.`);

        for (const test of orphaned) {
            test.pharmacist = pharmacist._id;
            await test.save();
            console.log(`- Fixed: ${test.title}`);
        }

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

fixOrphanedDocs();
