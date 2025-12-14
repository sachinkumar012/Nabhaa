const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { sendAppointmentSMS } = require('../utils/smsService');

const testSMS = async () => {
    console.log('Testing SMS Service...');
    const apiKey = process.env.FAST2SMS_API_KEY;
    console.log('API Key present:', !!apiKey);
    if (apiKey) {
        console.log('API Key start:', apiKey.substring(0, 5));
        console.log('API Key length:', apiKey.length);
    }

    // Use the phone number from the user's previous attempt or a dummy one if not available
    // The user used 9318496221 in the chat history.
    const phoneNumber = '9318496221';
    const appointmentDetails = {
        name: 'Test User',
        date: 'Tomorrow',
        time: '10:00 AM'
    };

    try {
        const result = await sendAppointmentSMS(phoneNumber, appointmentDetails);
        console.log('SMS Send Result:', result);
    } catch (error) {
        console.error('Test Script Error:', error);
    }
};

testSMS();
