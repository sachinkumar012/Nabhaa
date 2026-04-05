const nodemailer = require('nodemailer');
const axios = require('axios');

const otpLoginEmailHtml = (otp) => `
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

/**
 * Send OTP via Resend HTTPS API (works on Render; Gmail SMTP often times out from cloud hosts).
 * Set RESEND_API_KEY in env. Use RESEND_FROM (e.g. "Nabha <otp@yourdomain.com>") after verifying domain in Resend.
 */
const sendOtpEmailViaResend = async (email, otp) => {
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
        console.error('[EMAIL] RESEND_API_KEY is not set in environment variables!');
        throw new Error('RESEND_API_KEY is missing. Please set it in Render → Environment.');
    }

    const from =
        process.env.RESEND_FROM?.trim() || 'Nabha Healthcare <onboarding@resend.dev>';

    console.log(`[EMAIL] Calling Resend API → from: ${from}, to: ${email}`);

    try {
        const { data, status } = await axios.post(
            'https://api.resend.com/emails',
            {
                from,
                to: [email],
                subject: 'Your Login OTP - Nabha Healthcare',
                html: otpLoginEmailHtml(otp),
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 20000,
            }
        );

        console.log(`[EMAIL] Resend API success (HTTP ${status}), id:`, data?.id);
        return true;
    } catch (err) {
        const httpStatus = err.response?.status;
        const body = err.response?.data;
        console.error(`[EMAIL] Resend API error (HTTP ${httpStatus}):`, JSON.stringify(body) || err.message);
        throw err;
    }
};

/**
 * Transporter using Gmail SMTP over port 465 (SSL) — required for Render/cloud hosts.
 * Port 587 (STARTTLS) is blocked by Render; port 465 with secure:true works reliably.
 */
const createTransporter = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('[EMAIL] CRITICAL: SMTP_USER or SMTP_PASS is not configured!');
        throw new Error('Email service configuration missing. Please set SMTP_USER and SMTP_PASS.');
    }

    // Force port 465 + SSL on Render (production). Port 587/STARTTLS is blocked there.
    const isProduction = process.env.NODE_ENV === 'production';
    const port = isProduction ? 465 : parseInt(process.env.SMTP_PORT || '587');
    const secure = isProduction ? true : port === 465;

    const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 25000,
        greetingTimeout: 25000,
        socketTimeout: 30000,
        tls: {
            rejectUnauthorized: false,
        },
    };

    console.log(`[EMAIL] Transporter → host:${config.host} port:${config.port} secure:${config.secure}`);
    return nodemailer.createTransport(config);
};

const sendAppointmentEmail = async (email, appointmentDetails) => {
    try {
        const transporter = createTransporter();

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

        console.log("Appointment email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending appointment email:", error);
        return false;
    }
};

const sendOtpEmail = async (email, otp) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const resendKey = process.env.RESEND_API_KEY?.trim();

    // PRIMARY on Render/production: Use Resend HTTPS API (SMTP is blocked on Render)
    if (isProduction && resendKey) {
        console.log(`[EMAIL] Production mode → Sending OTP to ${email} via Resend API`);
        try {
            return await sendOtpEmailViaResend(email, otp);
        } catch (resendErr) {
            const body = resendErr.response?.data;
            const detail = body ? JSON.stringify(body) : resendErr.message;
            console.error('[EMAIL] Resend API failed:', detail);
            throw resendErr;
        }
    }

    // LOCAL / DEV: Try Gmail SMTP (works fine locally)
    console.log(`[EMAIL] Dev mode → Sending OTP to ${email} via Gmail SMTP`);
    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            console.log(`[EMAIL] Attempt ${attempt}/2`);
            const transporter = createTransporter();

            const info = await transporter.sendMail({
                from: `"Nabha Healthcare" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Your Login OTP - Nabha Healthcare',
                html: otpLoginEmailHtml(otp),
            });

            console.log('[EMAIL] OTP sent successfully via Gmail. MessageId:', info.messageId);
            return true;
        } catch (err) {
            lastError = err;
            console.error(`[EMAIL] Attempt ${attempt} FAILED:`, err.message);
            if (attempt < 2) await new Promise(r => setTimeout(r, 2000));
        }
    }

    // FALLBACK: Try Resend if Gmail SMTP failed in dev AND key is available
    if (resendKey) {
        console.log('[EMAIL] Gmail SMTP failed. Falling back to Resend API...');
        try {
            return await sendOtpEmailViaResend(email, otp);
        } catch (resendErr) {
            const body = resendErr.response?.data;
            const detail = body ? JSON.stringify(body) : resendErr.message;
            console.error('[EMAIL] Resend fallback also failed:', detail);
        }
    }

    // All methods failed
    throw lastError;
};

const sendLabBookingConfirmation = async (email, details) => {
    try {
        const transporter = createTransporter();

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
        const transporter = createTransporter();

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

const sendCallbackRequest = async (phone) => {
    try {
        const transporter = createTransporter();

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 500px;">
                <h2 style="color: #0F8B8D;">📞 New Callback Request — Nabha Lab Tests</h2>
                <p>A customer has requested a callback from the <strong>Lab Tests</strong> section.</p>
                <div style="background:#f0fdf4; border-left:4px solid #0F8B8D; padding:16px; border-radius:8px; margin:20px 0;">
                    <p style="margin:0; font-size:1.2rem;"><strong>Customer Phone:</strong> +91 ${phone}</p>
                    <p style="margin:8px 0 0; color:#6b7280; font-size:0.875rem;">Requested at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
                </div>
                <p>Please call the customer on <strong>+91 ${phone}</strong> within 30 minutes.</p>
                <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;" />
                <p style="font-size:0.8rem; color:#9ca3af;">This is an automated notification from Nabha Healthcare Lab Tests portal.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Nabha Healthcare" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,   // send to admin Gmail
            subject: `📞 Callback Request: +91 ${phone} — Nabha Lab Tests`,
            html: message
        });

        console.log('[Callback] Email sent for phone:', phone);
        return true;
    } catch (error) {
        console.error('[Callback] Email error:', error);
        return false;
    }
};

const sendInsuranceConfirmation = async (email, details, pdfBuffer) => {
    try {
        const transporter = createTransporter();

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto;">
                <h2 style="color: #0f8b8d;">Health Insurance Confirmed! 🛡️</h2>
                <p>Dear <strong>${details.name}</strong>,</p>
                <p>Thank you for choosing Nabha Healthcare. Your health insurance policy has been successfully activated.</p>
                
                <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #0f8b8d; border-radius: 4px; margin: 20px 0;">
                    <p><strong>Policy Number:</strong> ${details.policyNumber}</p>
                    <p><strong>Plan Name:</strong> ${details.planName}</p>
                    <p><strong>Coverage:</strong> ${details.coverage}</p>
                    <p><strong>Valid Till:</strong> ${new Date(details.validTill).toLocaleDateString('en-IN')}</p>
                    <p><strong>Premium Paid:</strong> ₹${details.premiumPaid}</p>
                </div>

                <p>We have attached your official <strong>Insurance Policy Card</strong> to this email as a PDF. Please download and keep it safe. You can present this digital card at any of our 500+ network hospitals for cashless treatment.</p>
                
                <p>If you have any questions or need to file a claim, our 24/7 helpline is always available at 9318496221.</p>

                <p>Stay healthy,<br><strong>Nabha Healthcare Team</strong></p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Nabha Healthcare" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Health Insurance Policy Activated - ${details.policyNumber}`,
            html: message,
            attachments: [
                {
                    filename: `Nabha_Insurance_Card_${details.policyNumber}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });

        console.log("Insurance Confirmation Email sent to:", email);
        return true;
    } catch (error) {
        console.error("Error sending Insurance Confirmation email:", error);
        return false;
    }
};

module.exports = { sendAppointmentEmail, sendOtpEmail, sendLabBookingConfirmation, sendVideoConsultationEmail, sendCallbackRequest, sendInsuranceConfirmation };

