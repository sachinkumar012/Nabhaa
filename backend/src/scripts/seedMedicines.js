const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Medicine = require('../models/Medicine');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nabhaa_healthcare');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        // Read JSON file
        const dataPath = path.join(__dirname, '../data/indian_medicine_data.json');
        console.log(`Reading data from: ${dataPath}`);

        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const medicines = JSON.parse(rawData);

        console.log(`Found ${medicines.length} medicines to import.`);

        // Transform data
        const medicineDocs = medicines.map(med => ({
            name: med.name,
            price: parseFloat(med['price(₹)']) || 0,
            manufacturer: med.manufacturer_name,
            type: med.type,
            packSize: med.pack_size_label,
            composition: (med.short_composition1 + ' ' + med.short_composition2).trim(),
            isDiscontinued: med.Is_discontinued === 'TRUE'
        }));

        // Batch insert to avoid memory issues if data is huge, but standard insertMany uses batches internally
        // However, for very large datasets, we might need chunking.
        // Assuming the file size (96MB) fits in memory for this operation or existing max listeners.
        // Let's try inserting in chunks of 5000 just to be safe and provide progress.

        const CHUNK_SIZE = 5000;
        let count = 0;

        // Clear existing data? Let's assume yes for a clean seed or useupsert. 
        // For now, let's delete all to avoid duplicates on re-run as request implies setup.
        await Medicine.deleteMany();
        console.log('Old medicine data destroyed...');

        for (let i = 0; i < medicineDocs.length; i += CHUNK_SIZE) {
            const chunk = medicineDocs.slice(i, i + CHUNK_SIZE);
            await Medicine.insertMany(chunk);
            count += chunk.length;
            console.log(`Imported ${count} medicines...`);
        }

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // destroyData(); // Not implemented separately
} else {
    importData();
}
