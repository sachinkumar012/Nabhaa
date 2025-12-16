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
        console.log("DEBUG OTP:", otp);
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
        console.log("---------------------------------------------------");
        console.log("DEV FALLBACK: Email failed. Here is the OTP:");
        console.log("OTP:", otp);
        console.log("---------------------------------------------------");
        return true;
    }
};

const sendLabBookingConfirmation = async (email, details) => {
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
            tls: { rejectUnauthorized: false }
        });

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #115E59;">Lab Test Booking Confirmed! 🧪</h2>
                <p>Dear <strong>${details.patientName}</strong>,</p>
                <p>Your lab test booking has been confirmed.</p>
                
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Test Name:</strong> ${details.testName}</p>
                    <p><strong>Booking ID:</strong> ${details.orderId}</p>
                    <p><strong>Date:</strong> ${details.date}</p>
                    <p><strong>Amount to Pay:</strong> ₹${details.price}</p>
                </div>

                <p>Our team will contact you shortly for sample collection.</p>
                <p>Best regards,<br>Nabha Healthcare Team</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Nabha Healthcare" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Lab Test Booking Confirmed - Nabha Healthcare",
            html: message
        });

        console.log("Lab Booking Email sent to:", email);
        return true;
    } catch (error) {
        console.error("Error sending Lab Booking email:", error);
        return false;
    }
};

const sendVideoConsultationEmail = async (doctorEmail, details) => {
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
            tls: { rejectUnauthorized: false }
        });

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4F46E5;">New Video Consultation Request 📹</h2>
                <p>Hello Dr. <strong>${details.doctorName}</strong>,</p>
                <p>You have a new video consultation request.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Patient:</strong> ${details.patientName}</p>
                    <p><strong>Type:</strong> ${details.type === 'instant' ? '🚀 Instant Call (Waiting Now)' : '📅 Scheduled Call'}</p>
                    <p><strong>Date:</strong> ${details.date}</p>
                    <p><strong>Time:</strong> ${details.time}</p>
                    ${details.reason ? `<p><strong>Reason:</strong> ${details.reason}</p>` : ''}
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${details.meetingLink}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                        Join Video Call
                    </a>
                </div>

                <p style="font-size: 14px; color: #666;">Or copy this link: <br>${details.meetingLink}</p>
                
                <p>Best regards,<br>Nabha Healthcare Team</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Nabha Healthcare" <${process.env.SMTP_USER}>`,
            to: doctorEmail,
            subject: `Video Consultation Request - ${details.patientName}`,
            html: message
        });

        console.log("Video Consultation Email sent to:", doctorEmail);
        return true;
    } catch (error) {
        console.error("Error sending Video Consultation email:", error);
        return false;
    }
};

module.exports = { sendAppointmentEmail, sendOtpEmail, sendLabBookingConfirmation, sendVideoConsultationEmail };
