const nodemailer = require('nodemailer');

const sendAppointmentEmail = async (email, appointmentDetails) => {
    try {
        const port = Number(process.env.SMTP_PORT);
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: port,
            secure: port === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS.replace(/\s+/g, '')
            },
            connectionTimeout: 10000, // 10 seconds
            logger: true,
            debug: true,
            tls: {
                rejectUnauthorized: false // Helps if certificates are weird
            }
        });

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4F46E5;">Appointment Confirmed! 🎉</h2>
                <p>Dear <strong>${appointmentDetails.name}</strong>,</p>
                <p>Your appointment has been successfully booked.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Doctor:</strong> ${appointmentDetails.doctor}</p>
                    <p><strong>Date:</strong> ${appointmentDetails.date}</p>
                    <p><strong>Time:</strong> ${appointmentDetails.time}</p>
                    <p><strong>Reason for Visit:</strong> ${appointmentDetails.reason}</p>
                    <p><strong>Booking ID:</strong> ${appointmentDetails.id}</p>
                </div>

                <p>Please arrive 15 minutes early.</p>
                <p>Best regards,<br>Nabha Healthcare Team</p>
            </div>
        `;

        const info = await transporter.sendMail({
            from: `"Nabha Healthcare" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Appointment Confirmation - Nabha Healthcare",
            html: message
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

const sendOtpEmail = async (email, otp) => {
    try {
        const port = Number(process.env.SMTP_PORT);
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: port,
            secure: port === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS.replace(/\s+/g, '')
            },
            connectionTimeout: 10000,
            logger: true,
            debug: true,
            tls: {
                rejectUnauthorized: false
            }
        });

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #115E59;">Login Verification Code</h2>
                <p>Hello,</p>
                <p>Your OTP for logging into Nabha Healthcare is:</p>
                
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <h1 style="color: #15803d; letter-spacing: 5px; margin: 0;">${otp}</h1>
                </div>

                <p>This code is valid for 10 minutes. Do not share this code with anyone.</p>
                <p>Best regards,<br>Nabha Healthcare Team</p>
            </div>
        `;

        const info = await transporter.sendMail({
            from: `"Nabha Healthcare" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your Login OTP - Nabha Healthcare",
            html: message
        });

        console.log("OTP Email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw error; // Throw error to be caught by controller
    }
};

module.exports = { sendAppointmentEmail, sendOtpEmail };
