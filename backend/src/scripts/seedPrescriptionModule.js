require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const DrugInteraction = require('../models/DrugInteraction');

const seedData = async () => {
    try {
        const mongoUri = (process.env.MONGODB_URI || 'mongodb://localhost:27017/nabhaa').trim();
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected for Seeding...');

        // Clear previous test interactions
        await DrugInteraction.deleteMany({});
        console.log('Cleared existing Drug Interactions');

        // Insert some test medicines if they don't exist
        const sampleMedicines = [
            {
                name: "Dolo 650",
                price: 30.00,
                manufacturer: "Micro Labs Ltd",
                type: "allopathy",
                packSize: "strip of 15 tablets",
                composition: "Paracetamol (650mg)",
                isDiscontinued: true // Force it to recommend a substitute
            },
            {
                name: "Calpol 650",
                price: 28.50,
                manufacturer: "Glaxo SmithKline",
                type: "allopathy",
                packSize: "strip of 15 tablets",
                composition: "Paracetamol (650mg)",
                isDiscontinued: false
            },
            {
                name: "Crocin 650",
                price: 25.00,
                manufacturer: "GSK",
                type: "allopathy",
                packSize: "strip of 15 tablets",
                composition: "Paracetamol (650mg)",
                isDiscontinued: false
            },
            {
                name: "Augmentin 625 Duo Tablet",
                price: 223.42,
                manufacturer: "Glaxo SmithKline",
                type: "allopathy",
                packSize: "strip of 10 tablets",
                composition: "Amoxycillin (500mg) Clavulanic Acid (125mg)",
                isDiscontinued: true // Force suggestion
            },
            {
                name: "Amoxyclav 625 Tablet",
                price: 200.00,
                manufacturer: "Abbott",
                type: "allopathy",
                packSize: "strip of 10 tablets",
                composition: "Amoxycillin (500mg) Clavulanic Acid (125mg)",
                isDiscontinued: false
            },
            {
                name: "Methotrexate 2.5mg Tablet",
                price: 150.00,
                manufacturer: "Pfizer",
                type: "allopathy",
                packSize: "strip of 10 tablets",
                composition: "Methotrexate (2.5mg)",
                isDiscontinued: false
            },
            {
                name: "Warfarin 5mg Tablet",
                price: 120.00,
                manufacturer: "Zydus",
                type: "allopathy",
                packSize: "strip of 10 tablets",
                composition: "Warfarin (5mg)",
                isDiscontinued: false
            },
            {
                name: "Sildenafil 50mg Tablet",
                price: 250.00,
                manufacturer: "Pfizer",
                type: "allopathy",
                packSize: "strip of 4 tablets",
                composition: "Sildenafil (50mg)",
                isDiscontinued: false
            },
            {
                name: "Nitroglycerin 2.6mg Tablet",
                price: 80.00,
                manufacturer: "Abbott",
                type: "allopathy",
                packSize: "strip of 30 tablets",
                composition: "Nitroglycerin (2.6mg)",
                isDiscontinued: false
            },
            {
                name: "Montair LC",
                price: 150.00,
                manufacturer: "Cipla",
                type: "allopathy",
                packSize: "strip of 10 tablets",
                composition: "Montelukast (10mg) Levocetirizine (5mg)",
                isDiscontinued: false
            },
            {
                name: "Zifi 200 Tablet",
                price: 105.00,
                manufacturer: "FDC Ltd",
                type: "allopathy",
                packSize: "strip of 10 tablets",
                composition: "Cefixime (200mg)",
                isDiscontinued: false
            },
            {
                name: "Monocef 1gm Injection",
                price: 60.00,
                manufacturer: "Aristo Pharmaceuticals",
                type: "allopathy",
                packSize: "vial of 1 injection",
                composition: "Ceftriaxone (1000mg)",
                isDiscontinued: false
            },
            {
                name: "Hepagyl Plus",
                price: 220.00,
                manufacturer: "Generic Labs",
                type: "allopathy",
                packSize: "bottle of 200ml syrup",
                composition: "Silymarin and L-Ornithine",
                isDiscontinued: false
            },
            {
                name: "Razo-D Tablet",
                price: 115.00,
                manufacturer: "Dr Reddy's Labs",
                type: "allopathy",
                packSize: "strip of 10 tablets",
                composition: "Rabeprazole (20mg) Domperidone (30mg)",
                isDiscontinued: false
            },
            {
                name: "Benylin LS Syrup",
                price: 95.00,
                manufacturer: "Johnson & Johnson",
                type: "allopathy",
                packSize: "bottle of 100ml syrup",
                composition: "Levosalbutamol Ambroxol Guaiphenesin",
                isDiscontinued: false
            }
        ];

        // Upsert Medicines to avoid duplicates
        for (let med of sampleMedicines) {
            await Medicine.findOneAndUpdate(
                { name: med.name },
                { $set: med },
                { upsert: true, new: true }
            );
        }
        console.log('Sample Medicines upserted successfully!');

        // 3. Insert Dangerous Drug Interactions
        const interactions = [
            {
                salt1: "paracetamol",
                salt2: "warfarin",
                severity: "high",
                description: "Concurrent use of high-dose paracetamol and warfarin may increase the risk of bleeding due to elevated INR."
            },
            {
                salt1: "amoxycillin",
                salt2: "methotrexate",
                severity: "high",
                description: "Amoxycillin can decrease the clearance of methotrexate, leading to methotrexate toxicity (bone marrow suppression)."
            },
            {
                salt1: "sildenafil",
                salt2: "nitroglycerin",
                severity: "contraindicated",
                description: "Absolute contraindication. Concurrent use can cause profound and severe hypotension which can be fatal."
            }
        ];

        for (let interaction of interactions) {
            await DrugInteraction.findOneAndUpdate(
                { salt1: interaction.salt1, salt2: interaction.salt2 },
                { $set: interaction },
                { upsert: true, new: true }
            );
        }
        console.log('Dangerous Drug Interactions seeded successfully!');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
