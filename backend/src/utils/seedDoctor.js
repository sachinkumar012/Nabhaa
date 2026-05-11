const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('../models/doctorModel');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDoctor = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const email = 'doctor@nabha.com';
        const password = 'doctor123';

        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            console.log('Doctor already exists. Updating to approved...');
            existingDoctor.isApproved = true;
            await existingDoctor.save();
            console.log('Doctor approved successfully.');
        } else {
            const newDoctor = await Doctor.create({
                name: 'Dr. John Doe',
                email: email,
                password: password,
                specialty: 'Cardiology',
                experience: '10 Years',
                location: 'Chandigarh',
                isApproved: true,
                image: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'
            });
            console.log('New Approved Doctor Created:');
            console.log('Email:', email);
            console.log('Password:', password);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding doctor:', error);
        process.exit(1);
    }
};

seedDoctor();
