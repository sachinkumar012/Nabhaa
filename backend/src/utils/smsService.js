const axios = require('axios');

const sendAppointmentSMS = async (phoneNumber, appointmentDetails) => {
    try {
        const apiKey = process.env.FAST2SMS_API_KEY;

        if (!apiKey) {
            console.warn('FAST2SMS_API_KEY is not set. SMS will not be sent.');
            return false;
        }

        const message = `Dear ${appointmentDetails.name}, your appointment with Dr. Sharma is confirmed for ${appointmentDetails.date} at ${appointmentDetails.time}. Please arrive 15 mins early. - Nabha Healthcare`;

        // Sanitize phone number: remove non-digits, take last 10
        const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);

        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            message: message,
            language: 'english',
            route: 'q',
            numbers: cleanPhone
        }, {
            headers: {
                authorization: apiKey
            }
        });

        console.log('SMS API Response:', response.data);
        return response.data.return;
    } catch (error) {
        console.error('Error sending SMS:', error.message);
        if (error.response) {
            console.error('Fast2SMS Error Details:', error.response.data);
        }
        return false;
    }
};

module.exports = { sendAppointmentSMS };
