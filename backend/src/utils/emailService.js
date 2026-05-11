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

// ─── Free E-Consultation Request Email ──────────────────────────────────────────

const sendConsultationRequest = async (details) => {
  const fromAddress =
    process.env.SMTP_USER?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "noreply@nabha.com";

  const mailOptions = {
    from: `"Nabha Healthcare" <${fromAddress}>`,
    to: process.env.SMTP_USER?.trim() || "support@nabha.com",
    subject: `🚨 New Free E-Consultation Request: ${details.name}`,
    html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 500px;">
                <h2 style="color: #E51C23;">New Free E-Consultation Request</h2>
                <div style="background:#f9fafb; border-left:4px solid #E51C23; padding:16px; border-radius:8px; margin:20px 0;">
                    <p><strong>Name:</strong> ${details.name}</p>
                    <p><strong>Mobile:</strong> ${details.mobile}</p>
                    <p><strong>City:</strong> ${details.city}</p>
                    <p><strong>Problem:</strong><br/> ${details.problem}</p>
                    <p style="margin:16px 0 0; color:#6b7280; font-size:0.875rem;">Submitted at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
                </div>
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
    console.error("[Consultation] Email error:", error);
    return false;
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  sendAppointmentEmail,
  sendOtpEmail,
  sendLabBookingConfirmation,
  sendVideoConsultationEmail,
  sendCallbackRequest,
  sendInsuranceConfirmation,
  sendConsultationRequest,
  sendOrderStatusEmail,
  sendCodConversionEmail,
  sendPaymentSuccessEmail,
};

// ─── Order Status Email ────────────────────────────────────────────────────────

const STATUS_COLORS = {
  Pending:          { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: '⏳' },
  Accepted:         { bg: '#DBEAFE', border: '#3B82F6', text: '#1E3A8A', icon: '✅' },
  Processing:       { bg: '#DBEAFE', border: '#3B82F6', text: '#1E3A8A', icon: '🔄' },
  Packed:           { bg: '#EDE9FE', border: '#8B5CF6', text: '#4C1D95', icon: '📦' },
  'Out for Delivery':{ bg: '#EDE9FE', border: '#8B5CF6', text: '#4C1D95', icon: '🚚' },
  Delivered:        { bg: '#D1FAE5', border: '#10B981', text: '#064E3B', icon: '✔️' },
  Cancelled:        { bg: '#FEE2E2', border: '#EF4444', text: '#7F1D1D', icon: '❌' },
};

const STATUS_MESSAGES = {
  Pending:           'Your order has been placed and is awaiting confirmation.',
  Accepted:          'Great news! Your order has been accepted by our pharmacy partner.',
  Processing:        'Your medicines are being prepared with care.',
  Packed:            'Your order is packed and ready for dispatch.',
  'Out for Delivery':'Your order is on its way! Expect delivery soon.',
  Delivered:         'Your order has been delivered. Thank you for choosing Nabha!',
  Cancelled:         'Your order has been cancelled. Contact support if this was unexpected.',
};

async function sendOrderStatusEmail(customer, order, newStatus) {
  const cfg = STATUS_COLORS[newStatus] || STATUS_COLORS.Pending;
  const msg = STATUS_MESSAGES[newStatus] || '';
  const orderId = String(order._id).slice(-8).toUpperCase();
  const fromAddress = process.env.SMTP_USER?.trim() || process.env.RESEND_FROM?.trim() || 'noreply@nabha.com';

  const itemRows = (order.orderItems || []).map(item =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:center;">x${item.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:right;">₹${item.price * item.qty}</td>
    </tr>`
  ).join('');

  const mailOptions = {
    from: `"Nabha Healthcare" <${fromAddress}>`,
    to: customer.email,
    subject: `${cfg.icon} Order #${orderId} — ${newStatus} | Nabha Health Mart`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#115E59 0%,#0F766E 100%);padding:32px 28px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">${cfg.icon}</div>
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Order ${newStatus}</h1>
          <p style="color:#99f6e4;margin:8px 0 0;font-size:14px;">Order #${orderId}</p>
        </div>
        <!-- Status Banner -->
        <div style="background:${cfg.bg};border-left:4px solid ${cfg.border};padding:16px 24px;margin:24px;border-radius:8px;">
          <p style="margin:0;color:${cfg.text};font-weight:600;font-size:15px;">${msg}</p>
        </div>
        <!-- Customer Greeting -->
        <div style="padding:0 28px 16px;">
          <p style="color:#374151;font-size:15px;">Hello <strong>${customer.name || 'Valued Customer'}</strong>,</p>
          <p style="color:#6B7280;font-size:14px;line-height:1.6;">Here's a quick summary of your order update from <strong>Nabha Health Mart</strong>.</p>
        </div>
        <!-- Order Items -->
        <div style="margin:0 28px 24px;background:#f8fafc;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Item</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px;font-weight:700;color:#111827;font-size:14px;">Total</td>
                <td style="padding:12px;font-weight:800;color:#115E59;font-size:16px;text-align:right;">₹${order.totalPrice}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <!-- Payment Info -->
        <div style="margin:0 28px 28px;display:flex;gap:16px;">
          <div style="flex:1;background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0;">
            <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;">Payment</p>
            <p style="margin:0;font-weight:700;color:#1e293b;font-size:14px;">${order.paymentMethod || 'COD'}${order.isPaid ? ' ✓ Paid' : ''}</p>
          </div>
        </div>
        <!-- Footer -->
        <div style="background:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 Nabha Healthcare. All rights reserved.</p>
          <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">This is an automated notification. Do not reply to this email.</p>
        </div>
      </div>
    `
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendViaSMTP(mailOptions);
    } else {
      await sendViaResend(mailOptions);
    }
    return true;
  } catch (err) {
    console.error('[EMAIL] sendOrderStatusEmail error:', err.message);
    throw err;
  }
}

// ─── COD Conversion Suggestion Email ─────────────────────────────────────────

async function sendCodConversionEmail(customer, order, paymentLink) {
  const orderId = String(order._id).slice(-8).toUpperCase();
  const fromAddress = process.env.SMTP_USER?.trim() || process.env.RESEND_FROM?.trim() || 'noreply@nabha.com';

  const mailOptions = {
    from: `"Nabha Healthcare" <${fromAddress}>`,
    to: customer.email,
    subject: `💳 Pay Online & Get Priority Dispatch — Order #${orderId}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#1D4ED8 0%,#3B82F6 100%);padding:36px 28px;text-align:center;">
          <div style="font-size:44px;margin-bottom:8px;">💳</div>
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Complete Payment Online</h1>
          <p style="color:#BFDBFE;margin:8px 0 0;font-size:14px;">Get faster processing & priority dispatch</p>
        </div>
        <div style="padding:28px;">
          <p style="color:#374151;font-size:15px;">Hello <strong>${customer.name || 'Valued Customer'}</strong>,</p>
          <p style="color:#6B7280;font-size:14px;line-height:1.7;">
            You placed Order <strong>#${orderId}</strong> worth <strong>₹${order.totalPrice}</strong> with Cash on Delivery.
            To avoid delivery delays and ensure <strong>faster processing</strong>, you can securely complete your payment online before dispatch.
          </p>
          <!-- Benefits -->
          <div style="background:#EFF6FF;border-radius:12px;padding:20px;margin:20px 0;">
            <h3 style="margin:0 0 14px;color:#1E3A8A;font-size:14px;text-transform:uppercase;letter-spacing:.5px;">Why Pay Online?</h3>
            <div style="display:grid;gap:10px;">
              ${['⚡ Faster order processing & dispatch', '📦 Priority queue over COD orders', '🤝 100% contactless delivery experience', '🔒 Secure, encrypted payment gateway', '✅ Instant confirmation & digital receipt'].map(b => `<div style="display:flex;align-items:center;gap:10px;font-size:14px;color:#1e40af;">${b}</div>`).join('')}
            </div>
          </div>
          <!-- Order Summary -->
          <div style="background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:24px;border:1px solid #e2e8f0;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#64748b;font-size:13px;">Order ID</span>
              <span style="font-weight:700;color:#0f172a;font-size:13px;">#${orderId}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#64748b;font-size:13px;">Amount Due</span>
              <span style="font-weight:800;color:#1D4ED8;font-size:16px;">₹${order.totalPrice}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#64748b;font-size:13px;">Estimated Delivery ETA</span>
              <span style="font-weight:600;color:#0f172a;font-size:13px;">1–3 Business Days</span>
            </div>
          </div>
          <!-- CTA Button -->
          ${paymentLink && paymentLink !== '#' ? `
          <div style="text-align:center;margin:28px 0;">
            <a href="${paymentLink}" style="display:inline-block;background:linear-gradient(135deg,#1D4ED8,#3B82F6);color:#ffffff;font-weight:700;font-size:16px;padding:16px 40px;border-radius:12px;text-decoration:none;box-shadow:0 4px 14px rgba(29,78,216,0.4);letter-spacing:.3px;">
              🔐 Pay Securely Now — ₹${order.totalPrice}
            </a>
            <p style="margin:12px 0 0;color:#94a3b8;font-size:12px;">This link is valid for 24 hours. Secure payment powered by Razorpay.</p>
          </div>
          ` : `<div style="background:#fef9c3;border-radius:10px;padding:16px;text-align:center;margin:20px 0;"><p style="margin:0;color:#92400e;font-size:14px;">Login to your dashboard to pay online for this order.</p></div>`}
        </div>
        <div style="background:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 Nabha Healthcare · Secure Payments by Razorpay</p>
        </div>
      </div>
    `
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendViaSMTP(mailOptions);
    } else {
      await sendViaResend(mailOptions);
    }
    return true;
  } catch (err) {
    console.error('[EMAIL] sendCodConversionEmail error:', err.message);
    throw err;
  }
}

// ─── Payment Success Email ────────────────────────────────────────────────────

async function sendPaymentSuccessEmail(customer, order) {
  const orderId = String(order._id).slice(-8).toUpperCase();
  const fromAddress = process.env.SMTP_USER?.trim() || process.env.RESEND_FROM?.trim() || 'noreply@nabha.com';

  const mailOptions = {
    from: `"Nabha Healthcare" <${fromAddress}>`,
    to: customer.email,
    subject: `✅ Payment Confirmed — Order #${orderId} | Nabha Health Mart`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:580px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <div style="background:linear-gradient(135deg,#059669 0%,#10B981 100%);padding:36px 28px;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">✅</div>
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Payment Successful!</h1>
          <p style="color:#A7F3D0;margin:8px 0 0;font-size:14px;">Your order is now prioritized for dispatch</p>
        </div>
        <div style="padding:28px;">
          <p style="color:#374151;font-size:15px;">Hello <strong>${customer.name || 'Valued Customer'}</strong>,</p>
          <p style="color:#6B7280;font-size:14px;line-height:1.7;">We've received your payment of <strong>₹${order.totalPrice}</strong> for Order <strong>#${orderId}</strong>. Your order has been moved to <strong>priority dispatch</strong>.</p>
          <div style="background:#D1FAE5;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
            <p style="margin:0;font-size:24px;font-weight:800;color:#065F46;">₹${order.totalPrice}</p>
            <p style="margin:6px 0 0;font-size:13px;color:#047857;">Payment Confirmed · ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>
        <div style="background:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 Nabha Healthcare. Thank you for your trust.</p>
        </div>
      </div>
    `
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendViaSMTP(mailOptions);
    } else {
      await sendViaResend(mailOptions);
    }
    return true;
  } catch (err) {
    console.error('[EMAIL] sendPaymentSuccessEmail error:', err.message);
    throw err;
  }
}

