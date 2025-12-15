const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LabTest = require('../models/labTestModel');

dotenv.config({ path: './.env' }); // Adjust path if needed

const sampleTests = [
    // Health Packages
    {
        title: 'Full Body Checkup',
        price: 1499,
        originalPrice: 2999,
        category: 'Health Packages',
        description: 'Includes 75+ tests: Liver, Kidney, Lipid Profile, Thyroid, and more.',
        features: ['Liver Function Test', 'Kidney Function Test', 'Lipid Profile', 'Thyroid Profile', 'Complete Blood Count', 'Urine Routine'],
        reportsWithin: '24 Hours',
        recommendedFor: 'Everyone > 18 Years'
    },
    {
        title: 'Advanced Health Checkup',
        price: 2499,
        originalPrice: 4999,
        category: 'Health Packages',
        description: 'Comprehensive screening including Iron, Calcium, and Vitamin profiles.',
        features: ['All Full Body Tests', 'Vitamin B12 & D3', 'Iron Profile', 'HbA1c', 'ESR'],
        reportsWithin: '24-36 Hours',
        recommendedFor: 'Adults > 30 Years'
    },
    // Diabetes
    {
        title: 'Diabetes Screening',
        price: 499,
        originalPrice: 999,
        category: 'Diabetes',
        description: 'HbA1c, Fasting Blood Sugar, and Urine Glucose.',
        features: ['HbA1c', 'Fasting Blood Glucose', 'Urine Glucose'],
        reportsWithin: '12 Hours',
        fastingRequired: true,
        recommendedFor: 'Diabetic Patients'
    },
    {
        title: 'HbA1c Test',
        price: 299,
        originalPrice: 599,
        category: 'Diabetes',
        description: 'Average blood sugar level over past 3 months.',
        features: ['HbA1c'],
        reportsWithin: '12 Hours',
        recommendedFor: 'Monitoring Diabetes'
    },
    // Hormonal
    {
        title: 'Thyroid Profile',
        price: 399,
        originalPrice: 799,
        category: 'Hormonal',
        description: 'T3, T4, and TSH levels check.',
        features: ['Triiodothyronine (T3)', 'Thyroxine (T4)', 'Thyroid Stimulating Hormone (TSH)'],
        reportsWithin: '24 Hours',
        recommendedFor: 'Thyroid Disorders'
    },
    {
        title: 'PCOS Profile',
        price: 1299,
        originalPrice: 2500,
        category: 'Hormonal',
        description: 'Hormonal check for Polycystic Ovary Syndrome.',
        features: ['LH', 'FSH', 'Prolactin', 'Testosterone', 'Insulin Fasting'],
        reportsWithin: '24-48 Hours',
        recommendedFor: 'Women with irregular periods'
    },
    // Vitamins
    {
        title: 'Vitamin Deficiency Panel',
        price: 899,
        originalPrice: 1599,
        category: 'Vitamins',
        description: 'Vitamin B12, Vitamin D, and Calcium.',
        features: ['Vitamin B12', 'Vitamin D Total', 'Calcium'],
        reportsWithin: '24 Hours',
        recommendedFor: 'Fatigue & Bone Health'
    },
    // Heart
    {
        title: 'Heart Health Package',
        price: 1299,
        originalPrice: 2499,
        category: 'Heart',
        description: 'ECG, Lipid Profile, Troponin-I, and hs-CRP.',
        features: ['Lipid Profile', 'Electrocardiogram (ECG)', 'hs-CRP', 'Troponin-I'],
        reportsWithin: '24 Hours',
        recommendedFor: 'Cardiac Risk Assessment'
    },
    {
        title: 'Lipid Profile',
        price: 399,
        originalPrice: 799,
        category: 'Heart',
        description: 'Cholesterol levels including HDL, LDL, and Triglycerides.',
        features: ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides'],
        reportsWithin: '12 Hours',
        fastingRequired: true
    },
    // Kidney
    {
        title: 'Kidney Function Test',
        price: 599,
        originalPrice: 1199,
        category: 'Kidney',
        description: 'Creatinine, Urea, Uric Acid, Sodium, Potassium, and Chloride.',
        features: ['Blood Urea Nitrogen', 'Serum Creatinine', 'Uric Acid', 'Electrolytes'],
        reportsWithin: '12-24 Hours'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        await LabTest.deleteMany({});
        console.log('Cleared existing lab tests');

        await LabTest.insertMany(sampleTests);
        console.log('Lab Tests Seeded Successfully');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
