const nodemailer = require("nodemailer");
const axios = require("axios");

// ─── Email Templates ──────────────────────────────────────────────────────────

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

// ─── RESEND EMAIL SERVICE (Primary for OTP on Production) ─────────────────────

const sendViaResend = async (mailOptions) => {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
      console.log("[EMAIL] RESEND_API_KEY not configured, skipping Resend");
      return false;
    }

    console.log(
      `[EMAIL] Attempting to send via Resend API to ${mailOptions.to}`,
    );

    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from:
          mailOptions.from ||
          process.env.RESEND_FROM?.trim() ||
          "Nabha <onboarding@resend.dev>",
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    );

    if (response.data && response.data.id) {
      console.log(`[EMAIL] ✓ Sent via Resend. MessageId: ${response.data.id}`);
      return true;
    }

    console.log(
      "[EMAIL] Resend API returned unexpected response:",
      response.data,
    );
    return false;
  } catch (error) {
    console.error("[EMAIL] Resend error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return false;
  }
};

// ─── SMTP Transporter Factory ─────────────────────────────────────────────────

/**
 * Creates a nodemailer transporter.
 * Tries port 587 (STARTTLS) first; if that fails the caller retries with port 465 (SSL).
 */
const createTransporter = (port) => {
  const user = process.env.SMTP_USER?.trim();
  // Strip ALL whitespace from app password (Gmail shows it with spaces but they must be removed)
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error("[EMAIL] SMTP_USER or SMTP_PASS is not configured!");
  }

  const secure = port === 465; // true = SSL (465), false = STARTTLS (587)

  const config = {
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 25000,
    tls: { rejectUnauthorized: false },
  };

  console.log(
    `[EMAIL] SMTP Transporter → host:${config.host} port:${config.port} secure:${config.secure}`,
  );
  return nodemailer.createTransport(config);
};

// ─── Core send helper (tries 587, then 465) ───────────────────────────────────

const sendViaSMTP = async (mailOptions) => {
  const ports = [587, 465];

  for (const port of ports) {
    try {
      console.log(`[EMAIL] Trying SMTP port ${port}...`);
      const transporter = createTransporter(port);
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `[EMAIL] ✓ Sent via SMTP port ${port}. MessageId: ${info.messageId}`,
      );
      return true;
    } catch (err) {
      console.error(`[EMAIL] ✗ Port ${port} FAILED: ${err.message}`);
      if (port === 465) throw err; // last attempt — propagate
    }
  }
};

// ─── OTP Email with Fallback ───────────────────────────────────────────────────

const sendOtpEmail = async (email, otp) => {
  console.log(`[EMAIL] Attempting to send OTP to ${email}`);

  // 1. Try SMTP first (if configured)
  const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (smtpConfigured) {
    try {
      const smtpMailOptions = {
        from: `"Nabha Healthcare" <${process.env.SMTP_USER?.trim()}>`,
        to: email,
        subject: "Your Login OTP - Nabha Healthcare",
        html: otpLoginEmailHtml(otp),
      };
      await sendViaSMTP(smtpMailOptions);
      return true;
    } catch (smtpError) {
      console.warn("[EMAIL] SMTP failed, attempting Resend fallback...");
    }
  } else {
    console.log("[EMAIL] SMTP not configured, attempting Resend...");
  }

  // 2. Try Resend as fallback (use RESEND_FROM which is verified)
  const resendMailOptions = {
    from: process.env.RESEND_FROM?.trim() || "Nabha <onboarding@resend.dev>",
    to: email,
    subject: "Your Login OTP - Nabha Healthcare",
    html: otpLoginEmailHtml(otp),
  };
  const resendSuccess = await sendViaResend(resendMailOptions);
  if (resendSuccess) return true;

  // 3. If both failed
  const errorMsg = !smtpConfigured
    ? "Email service not configured (missing SMTP_USER/SMTP_PASS or RESEND_API_KEY on Render)"
    : "Failed to send OTP via email service";

  throw new Error(errorMsg);
};

// ─── Appointment Email ────────────────────────────────────────────────────────

const sendAppointmentEmail = async (email, appointmentDetails) => {
  const fromAddress =
    process.env.SMTP_USER?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "noreply@nabha.com";

  const mailOptions = {
    from: `"Nabha Healthcare" <${fromAddress}>`,
    to: email,
    subject: "Appointment Confirmation - Nabha Healthcare",
    html: `
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
        `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendViaSMTP(mailOptions);
      return true;
    } else {
      return await sendViaResend(mailOptions);
    }
  } catch (error) {
    console.error("Error sending appointment email:", error);
    return false;
  }
};

// ─── Lab Booking Email ────────────────────────────────────────────────────────

const sendLabBookingConfirmation = async (email, details) => {
  const fromAddress =
    process.env.SMTP_USER?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "noreply@nabha.com";

  const mailOptions = {
    from: `"Nabha Healthcare" <${fromAddress}>`,
    to: email,
    subject: "Lab Test Booking Confirmed - Nabha Healthcare",
    html: `
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
        `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendViaSMTP(mailOptions);
      return true;
    } else {
      return await sendViaResend(mailOptions);
    }
  } catch (error) {
    console.error("Error sending Lab Booking email:", error);
    return false;
  }
};

// ─── Video Consultation Email ─────────────────────────────────────────────────

const sendVideoConsultationEmail = async (doctorEmail, details) => {
  const fromAddress =
    process.env.SMTP_USER?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "noreply@nabha.com";

  const mailOptions = {
    from: `"Nabha Healthcare" <${fromAddress}>`,
    to: doctorEmail,
    subject: `Video Consultation Request - ${details.patientName}`,
    html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4F46E5;">New Video Consultation Request 📹</h2>
                <p>Hello Dr. <strong>${details.doctorName}</strong>,</p>
                <p>You have a new video consultation request.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Patient:</strong> ${details.patientName}</p>
                    <p><strong>Type:</strong> ${details.type === "instant" ? "🚀 Instant Call (Waiting Now)" : "📅 Scheduled Call"}</p>
                    <p><strong>Date:</strong> ${details.date}</p>
                    <p><strong>Time:</strong> ${details.time}</p>
                    ${details.reason ? `<p><strong>Reason:</strong> ${details.reason}</p>` : ""}
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${details.meetingLink}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                        Join Video Call
                    </a>
                </div>
                <p style="font-size: 14px; color: #666;">Or copy this link: <br>${details.meetingLink}</p>
                <p>Best regards,<br>Nabha Healthcare Team</p>
            </div>
        `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendViaSMTP(mailOptions);
      return true;
    } else {
      return await sendViaResend(mailOptions);
    }
  } catch (error) {
    console.error("Error sending Video Consultation email:", error);
    return false;
  }
};

// ─── Callback Request Email ───────────────────────────────────────────────────

const sendCallbackRequest = async (phone) => {
  const fromAddress =
    process.env.SMTP_USER?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "noreply@nabha.com";

  const mailOptions = {
    from: `"Nabha Healthcare" <${fromAddress}>`,
    to: process.env.SMTP_USER?.trim() || "support@nabha.com",
    subject: `📞 Callback Request: +91 ${phone} — Nabha Lab Tests`,
    html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 500px;">
                <h2 style="color: #0F8B8D;">📞 New Callback Request — Nabha Lab Tests</h2>
                <p>A customer has requested a callback from the <strong>Lab Tests</strong> section.</p>
                <div style="background:#f0fdf4; border-left:4px solid #0F8B8D; padding:16px; border-radius:8px; margin:20px 0;">
                    <p style="margin:0; font-size:1.2rem;"><strong>Customer Phone:</strong> +91 ${phone}</p>
                    <p style="margin:8px 0 0; color:#6b7280; font-size:0.875rem;">Requested at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
                </div>
                <p>Please call the customer on <strong>+91 ${phone}</strong> within 30 minutes.</p>
                <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;" />
                <p style="font-size:0.8rem; color:#9ca3af;">This is an automated notification from Nabha Healthcare Lab Tests portal.</p>
            </div>
        `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendViaSMTP(mailOptions);
      return true;
    } else {
      return await sendViaResend(mailOptions);
    }
  } catch (error) {
    console.error("[Callback] Email error:", error);
    return false;
  }
};

// ─── Insurance Confirmation Email ─────────────────────────────────────────────

const sendInsuranceConfirmation = async (email, details, pdfBuffer) => {
  const fromAddress =
    process.env.SMTP_USER?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "noreply@nabha.com";

  const mailOptions = {
    from: `"Nabha Healthcare" <${fromAddress}>`,
    to: email,
    subject: `Health Insurance Policy Activated - ${details.policyNumber}`,
    html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto;">
                <h2 style="color: #0f8b8d;">Health Insurance Confirmed! 🛡️</h2>
                <p>Dear <strong>${details.name}</strong>,</p>
                <p>Thank you for choosing Nabha Healthcare. Your health insurance policy has been successfully activated.</p>
                <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #0f8b8d; border-radius: 4px; margin: 20px 0;">
                    <p><strong>Policy Number:</strong> ${details.policyNumber}</p>
                    <p><strong>Plan Name:</strong> ${details.planName}</p>
                    <p><strong>Coverage:</strong> ${details.coverage}</p>
                    <p><strong>Valid Till:</strong> ${new Date(details.validTill).toLocaleDateString("en-IN")}</p>
                    <p><strong>Premium Paid:</strong> ₹${details.premiumPaid}</p>
                </div>
                <p>We have attached your official <strong>Insurance Policy Card</strong> to this email as a PDF.</p>
                <p>If you have any questions, our 24/7 helpline is available at 9318496221.</p>
                <p>Stay healthy,<br><strong>Nabha Healthcare Team</strong></p>
            </div>
        `,
    attachments: pdfBuffer
      ? [
          {
            filename: `Nabha_Insurance_Card_${details.policyNumber}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ]
      : [],
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendViaSMTP(mailOptions);
      return true;
    } else {
      return await sendViaResend(mailOptions);
    }
  } catch (error) {
    console.error("Error sending Insurance Confirmation email:", error);
    return false;
  }
};

module.exports = {
  sendOtpEmail,
  sendAppointmentEmail,
  sendLabBookingConfirmation,
  sendVideoConsultationEmail,
  sendCallbackRequest,
  sendInsuranceConfirmation,
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  sendAppointmentEmail,
  sendOtpEmail,
  sendLabBookingConfirmation,
  sendVideoConsultationEmail,
  sendCallbackRequest,
  sendInsuranceConfirmation,
};
