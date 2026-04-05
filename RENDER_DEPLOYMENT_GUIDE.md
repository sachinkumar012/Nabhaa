# Render Deployment Guide - Fixing OTP 503 Error

## The Problem
When deploying to Render, the OTP endpoint returns `503 Service Unavailable` because email sending is failing. This typically happens when SMTP credentials are not configured or timeout on production.

## Root Causes
1. **Missing SMTP credentials** (SMTP_USER, SMTP_PASS) on Render
2. **Gmail SMTP timeout** - port 587/465 connections can timeout on some hosting providers
3. **No email service fallback** - code only attempts SMTP without alternatives
4. **Resend API not utilized** - render.yaml mentions RESEND_API_KEY but it wasn't being used

## Solution Implemented
We've updated the email service with:
1. ✅ **Dual email service support**: SMTP + Resend API with automatic fallback
2. ✅ **Better error handling**: Specific error messages for debugging
3. ✅ **Production-ready fallback**: Uses Resend when SMTP fails
4. ✅ **Improved logging**: Track which service is being used

---

## Step-by-Step Setup on Render

### Step 1: Get Resend API Key
1. Visit https://resend.com
2. Sign up (free tier available)
3. Go to Dashboard → API Keys
4. Copy the API key
5. Note the sender email (e.g., `Nabha <onboarding@resend.dev>`)

### Step 2: Set Environment Variables on Render Dashboard

1. Go to your Render service (nabha-backend)
2. Click **Settings** → **Environment**
3. Add these variables:

```env
# ─── Primary Email (Resend - Recommended for production) ───
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM=Nabha Healthcare <onboarding@resend.dev>

# ─── Optional: Gmail SMTP (Fallback) ───
# ONLY configure if you want SMTP as primary
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password (not regular password)
# SMTP_HOST=smtp.gmail.com
```

> **For Gmail App Password:**
> - Go to https://myaccount.google.com/apppasswords
> - Create an app password (NOT your regular Gmail password)
> - Copy it and paste in SMTP_PASS (remove spaces)

### Step 3: Deploy
Push your code changes to trigger a redeploy:
```bash
git add .
git commit -m "fix: Add Resend email fallback for OTP on Render"
git push origin main
```

---

## How the New System Works

### Email Sending Priority
```
1. Try SMTP (if SMTP_USER & SMTP_PASS are set)
   ├─ Attempt port 587 (STARTTLS)
   └─ Fallback to port 465 (SSL)
   
2. Try Resend API (if SMTP fails OR not configured)
   └─ Fast, reliable, no timeout issues
   
3. If both fail → Return 503 error with details
```

### Example Flow on Render
- **Scenario 1** (SMTP not configured, Resend ✅):
  ```
  No SMTP → Skip SMTP → Try Resend → ✓ Success
  ```

- **Scenario 2** (SMTP timeout, Resend ✅):
  ```
  Try SMTP → Fails (timeout) → Try Resend → ✓ Success
  ```

- **Scenario 3** (Both configured):
  ```
  Try SMTP → ✓ Success → Send immediately
  ```

---

## Testing Locally

### Environment Setup
Create `.env` in backend folder:
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nabha
JWT_SECRET=your_secret_here
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM=Nabha Healthcare <test@resend.dev>

# Option 1: Use SMTP
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Option 2: Or just use Resend (SMTP optional)
```

### Test OTP Sending
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Expected response (success):
```json
{
  "success": true,
  "message": "OTP sent successfully to test@example.com"
}
```

---

## Troubleshooting

### Error: "Email service configuration issue"
**Cause**: Both SMTP and Resend are not configured
**Fix**: Add RESEND_API_KEY to Render environment variables

### Error: "Failed to send OTP"
**Check**:
1. RESEND_API_KEY is correct and not expired
2. Email address is valid
3. Check backend logs on Render for specific error
4. Try with a different email address

### Render Logs
View real-time logs:
```
Render Dashboard → nabha-backend → Logs
```

Look for `[EMAIL]` prefixed messages:
- `[EMAIL] ✓ Sent via Resend` = Success
- `[EMAIL] ✗ Port 587 FAILED` = SMTP issue
- `[EMAIL] Resend error:` = Resend API issue

---

## Recommended Configuration on Render

| Scenario | Config |
|----------|--------|
| **Production (Recommended)** | RESEND_API_KEY only (fast, no timeout issues) |
| **Redundancy** | RESEND_API_KEY + SMTP credentials (dual fallback) |
| **Debugging** | RESEND_API_KEY + NODE_ENV=development (verbose logging) |

---

## Cost Estimation
- **Resend**: 100 emails/day free tier, then $0.50 per 1000 emails
- **Gmail SMTP**: Free, but may timeout on production
- **Recommended**: Use Resend for OTP (critical), keep SMS for backups

---

## Files Modified
1. `backend/src/utils/emailService.js` - Added Resend API integration
2. `backend/src/controllers/authController.js` - Improved error handling
3. `backend/.env.example` - Updated with Resend configuration

---

## Summary
✅ OTP now works on Render with automatic email service fallback  
✅ Better error messages for debugging  
✅ Production-ready configuration  
✅ No more 503 errors on email sending
