const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Doctor = require('../models/doctorModel');
const bcrypt = require('bcryptjs');

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

const doctors = [
    {
        name: 'Dr. John Doe',
        email: 'john@example.com',
        password: 'password123',
        specialty: 'Cardiologist',
        experience: '10 years',
        location: 'New York, USA',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2864&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        isApproved: true
    },
    {
        name: 'Dr. Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        specialty: 'Pediatrician',
        experience: '8 years',
        location: 'London, UK',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        isApproved: true
    },
    {
        name: 'Dr. Alan Grant',
        email: 'alan@example.com',
        password: 'password123',
        specialty: 'Orthopedic',
        experience: '15 years',
        location: 'Toronto, Canada',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        isApproved: true
    },
    {
        name: 'Dr. Sarah Connor',
        email: 'sarah@example.com',
        password: 'password123',
        specialty: 'Dermatologist',
        experience: '5 years',
        location: 'Los Angeles, USA',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        isApproved: true
    }
];

const importDoctors = async () => {
    try {
        await connectDB();

        // Clear existing details? Maybe check if they exist or just clear. 
        // Safer to clear for fresh seed.
        await Doctor.deleteMany();
        console.log('Doctors collection cleared.');

        const doctorDocs = doctors.map(doc => ({
            ...doc,
            // Password will be hashed by pre-save hook in model if we use create/save
            // insertMany bypasses pre-save hooks? NO. insertMany triggers middleware if option is set, 
            // but Mongoose 'insertMany' usually does validation. 
            // Let's loop and create to be safe with the pre-save hook for password hashing.
        }));

        for (const doc of doctorDocs) {
            const created = await Doctor.create(doc);
            console.log(`Created doctor: ${created.name}`);
        }

        console.log('Doctors Imported Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

importDoctors();
