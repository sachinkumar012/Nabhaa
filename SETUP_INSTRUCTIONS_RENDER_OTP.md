# Complete Environment Setup - OTP Fix for Render

## Files Modified Summary

### 1. backend/src/utils/emailService.js
**Changes**: Complete rewrite with dual email service support
- Added `sendViaResend()` - Resend API integration
- Updated `sendOtpEmail()` - Fallback logic (SMTP → Resend)
- Updated all email functions to support both services
- Added detailed logging for debugging

**Key Functions**:
```
sendViaResend(mailOptions)        // New - Resend API
sendViaSMTP(mailOptions)           // Existing - Gmail SMTP
sendOtpEmail(email, otp)          // Updated - Dual fallback
```

### 2. backend/src/controllers/authController.js
**Changes**: Improved error handling in sendOtp endpoint
- Added service configuration status logging
- Better error messages with debugging info
- Shows which services are configured

**Error Output Example**:
```javascript
'[AUTH] OTP Delivery Failed:', {
  identifier: 'user@email.com',
  isEmail: true,
  errorMessage: '...',
  smtpConfigured: false,
  resendConfigured: true,
  fast2smsConfigured: false,
}
```

### 3. backend/.env.example
**Changes**: Updated with complete email configuration
```
# Option 1: Resend (Recommended)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM=Nabha Healthcare <onboarding@resend.dev>

# Option 2: Gmail SMTP (Optional fallback)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
```

---

## Render Dashboard Setup (REQUIRED)

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up (free tier: 100 emails/day)
3. Verify email
4. Get API key from Dashboard

### Step 2: Add Environment Variables to Render
1. Go to **nabha-backend** service
2. Click **Settings** → **Environment**
3. Add these variables:

| Key | Value | Example |
|-----|-------|---------|
| `RESEND_API_KEY` | Your api key | `re_xxxxx...` |
| `RESEND_FROM` | Sender email | `Nabha <onboarding@resend.dev>` |
| `EXTRA: SMTP_USER` | (Optional) Gmail | `your-email@gmail.com` |
| `EXTRA: SMTP_PASS` | (Optional) App password | `xxxx xxxx xxxx xxxx` |

### Step 3: Redeploy
```bash
git add .
git commit -m "fix: Add Resend email fallback for OTP on Render"
git push origin main
```

Wait for Render to redeploy (~2-3 minutes)

---

## Local Testing

### Setup .env file
```bash
# backend/.env (create if doesn't exist)
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nabha
JWT_SECRET=dev_secret_key_123

# Email - Option 1 (Use Resend)
RESEND_API_KEY=re_your_test_key
RESEND_FROM=Nabha Healthcare <onboarding@resend.dev>

# Email - Option 2 (Use Gmail SMTP)
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password-without-spaces
```

### Test OTP Endpoint
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Send test request
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Expected Output
```json
{
  "success": true,
  "message": "OTP sent successfully to test@example.com"
}
```

### Check Console Logs
Should see:
```
[EMAIL] Attempting to send OTP to test@example.com
[EMAIL] SMTP not configured, attempting Resend...
[EMAIL] ✓ Sent via Resend. MessageId: xxxxx
```

---

## Configuration Options

### Option 1: Resend Only (Recommended ⭐)
Use for production on Render
```
RESEND_API_KEY=re_xxxxx
RESEND_FROM=Nabha <onboarding@resend.dev>
```
✅ Fast, no timeouts, reliable  
✅ Free tier: 100 emails/day  
❌ Cost after free tier

### Option 2: SMTP Only
Use for local development with Gmail
```
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
```
✅ Free forever  
✅ Full control  
❌ May timeout on Render  
❌ Need App Password

### Option 3: Dual Setup (Best Redundancy)
Use both for maximum reliability
```
RESEND_API_KEY=re_xxxxx
RESEND_FROM=...
SMTP_USER=...
SMTP_PASS=...
```
✅ Automatic fallback  
✅ Production-ready  
✅ Never fails (unless both down)

---

## Gmail App Password Setup (If Using SMTP)

### For Gmail SMTP Configuration:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" → "Windows Computer"
3. Google generates a password (16 chars, with spaces)
4. Copy it and remove all spaces
5. Add to SMTP_PASS

**Example**:
```
Generated: xxxx xxxx xxxx xxxx
Use as:   xxxxxxxxxxxxxxxx (remove spaces)
```

---

## Testing Checklist

- [ ] Resend account created
- [ ] RESEND_API_KEY copied
- [ ] Environment variables added to Render
- [ ] Backend redeployed on Render
- [ ] .env file created locally (for local testing)
- [ ] Local OTP test works (see test command above)
- [ ] Frontend OTP test works on Render
- [ ] Check logs for `[EMAIL] ✓` confirmation

---

## Troubleshooting

### "Email service configuration issue" Error
**Cause**: No email service configured  
**Solution**: Add `RESEND_API_KEY` to Render environment

### "Failed to send OTP" Error
**Check**:
1. Internet connection (Render can reach Resend)
2. API key is valid and not expired
3. Email address is valid format
4. Check Render logs: Dashboard → Logs → Search for `[EMAIL]`

### SMTP Timeout on Render
**This is expected**  
**Solution**: Use Resend API instead (primary recommendation)

### Still Getting 503 After Setup
1. Clear browser cache (Ctrl+Shift+Del)
2. Wait 5 minutes for Render redeploy to complete
3. Restart backend service (Render → nabha-backend → Manual Deploy)
4. Check logs for specific error message

---

## Production Deployment Checklist

Before going live:
- [ ] RESEND_API_KEY is SECRET (not in code)
- [ ] render.yaml doesn't have hardcoded API keys
- [ ] .env.example shows setup instructions
- [ ] Documentation created (RENDER_DEPLOYMENT_GUIDE.md)
- [ ] OTP tested end-to-end on staging/production
- [ ] Monitor Render logs for 24 hours
- [ ] Setup backup email if quota runs out

---

## Cost Breakdown

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Resend** | 100 emails/day | $0.50 per 1000 |
| **Gmail SMTP** | ∞ (free tier) | N/A |
| **Fast2SMS** | Limited | Pay per SMS |

**Recommendation**: Start with Resend free tier, upgrade if needed.

---

## Support & Documentation

- **Resend Docs**: https://resend.com/docs
- **Render Docs**: https://render.com/docs
- **GitHub Issues**: Check for similar OTP/email issues
- **Project Repo**: [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)

---

## Next Steps

1. ✅ Code changes applied (this repo)
2. **→ Get Resend API key** (https://resend.com)
3. **→ Add to Render environment**
4. **→ Redeploy backend**
5. **→ Test OTP functionality**
6. **→ Verify with live users**

**Estimated time**: 5-10 minutes for complete setup
