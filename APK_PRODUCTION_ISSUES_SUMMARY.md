# APK Production Issues Summary

## Overview

Two features work in Expo Go development but fail in production APK:

1. ❌ **Google Sign-In** - Returns Error 400: invalid_request
2. ❌ **Email Notifications** - Emails not sent after booking

---

## Issue 1: Google Sign-In Not Working in APK

### Problem
- Works perfectly in Expo Go
- Fails in production APK with: "Error 400: invalid_request - Custom URI scheme is not enabled for your Android client"

### Root Cause
Production SHA-1 certificate fingerprint not registered in Firebase Console.

### Solution
1. Get production SHA-1 from EAS credentials
2. Add SHA-1 to Firebase Console
3. Download updated google-services.json
4. Rebuild APK

### Detailed Guide
📄 See: `GOOGLE_SIGNIN_APK_FIX_STEPS.md`

### Status
⏳ **Waiting for user action** - Need to run `eas credentials` and add SHA-1 to Firebase

---

## Issue 2: Email Notifications Not Working in APK

### Problem
- Booking confirmation emails work in development
- No emails sent in production APK

### Root Cause
Environment variables (`.env` file) are NOT bundled into production APK builds. EmailJS credentials are missing at runtime.

### Two Solutions Available

#### Solution 1: Quick Fix (30 minutes)
- Bundle EmailJS credentials in `app.json`
- Update email service to use `expo-constants`
- ⚠️ Security risk: credentials exposed in APK

#### Solution 2: Proper Fix (1 hour) - RECOMMENDED
- Use backend email service (nodemailer + Brevo SMTP)
- More secure, reliable, and production-ready
- Backend already has email utility setup

### Detailed Guides
📄 See: 
- `FIX_EMAIL_NOTIFICATIONS_APK.md` - Problem analysis
- `EMAIL_NOTIFICATIONS_IMPLEMENTATION_GUIDE.md` - Step-by-step implementation

### Status
⏳ **Waiting for user decision** - Choose Solution 1 (quick) or Solution 2 (proper)

---

## Why These Issues Only Happen in APK

### Development (Expo Go)
- ✅ Uses development SHA-1 (already registered)
- ✅ Reads `.env` file directly
- ✅ Hot reload and live updates
- ✅ Debug mode with verbose logging

### Production (APK)
- ❌ Uses production SHA-1 (not registered yet)
- ❌ `.env` file NOT included in build
- ❌ Compiled and optimized code
- ❌ Different network/security policies

---

## Recommended Action Plan

### Priority 1: Fix Google Sign-In (Critical)

**Time Required:** 15-20 minutes

**Steps:**
1. Run `eas credentials` to get production SHA-1
2. Add SHA-1 to Firebase Console (Android app settings)
3. Download updated `google-services.json`
4. Replace in project root
5. Rebuild APK: `eas build --platform android --profile production`
6. Test Google Sign-In in new APK

**Impact:** High - Users can't sign in with Google

---

### Priority 2: Fix Email Notifications (Important)

**Time Required:** 1 hour (for proper solution)

**Recommended Approach:** Solution 2 (Backend Email Service)

**Steps:**
1. Sign up for Brevo SMTP (free tier - 300 emails/day)
2. Configure backend email credentials
3. Create backend notification endpoint
4. Update frontend email service
5. Test backend email sending
6. Rebuild APK
7. Test email notifications in APK

**Impact:** Medium - Users don't get booking confirmations

---

## Testing Checklist

After implementing fixes, test these scenarios in production APK:

### Google Sign-In Testing
- [ ] Open app and tap "Sign in with Google"
- [ ] Select Google account
- [ ] Verify successful sign-in
- [ ] Check user profile loads correctly
- [ ] Test sign-out and sign-in again

### Email Notifications Testing
- [ ] Sign in to app
- [ ] Make a test booking
- [ ] Check email inbox for confirmation
- [ ] Verify email content is correct
- [ ] Test with different email providers (Gmail, Outlook, etc.)

---

## Common Pitfalls to Avoid

### Google Sign-In
- ❌ Don't forget to download updated `google-services.json`
- ❌ Don't use development SHA-1 for production
- ❌ Don't skip rebuilding APK after Firebase changes

### Email Notifications
- ❌ Don't put sensitive credentials in `app.json` (use backend instead)
- ❌ Don't forget to start backend server for testing
- ❌ Don't skip testing email delivery before building APK

---

## Environment Variables Best Practices

### ❌ Wrong Approach (Current)
```env
# .env file (NOT bundled in APK)
EXPO_PUBLIC_EMAILJS_SERVICE_ID=service_xxx
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxx
EXPO_PUBLIC_EMAILJS_USER_ID=user_xxx
```

### ✅ Correct Approach (Option 1)
```json
// app.json (bundled in APK)
{
  "expo": {
    "extra": {
      "emailjs": {
        "serviceId": "service_xxx",
        "templateId": "template_xxx",
        "userId": "user_xxx"
      }
    }
  }
}
```

### ✅ Best Approach (Option 2)
```env
# backend/.env (server-side only, never exposed)
SMTP_HOST=smtp-relay.brevo.com
SMTP_EMAIL=your-email@example.com
SMTP_PASSWORD=your-smtp-key
```

---

## Backend Email Service Benefits

Why Solution 2 is better for email notifications:

1. **Security**
   - ✅ Credentials never exposed to client
   - ✅ Can't be extracted from APK
   - ✅ Server-side validation

2. **Reliability**
   - ✅ No CORS issues
   - ✅ Better error handling
   - ✅ Retry logic possible

3. **Features**
   - ✅ Rich HTML email templates
   - ✅ Attachments support
   - ✅ Email tracking
   - ✅ Bulk sending

4. **Scalability**
   - ✅ No rate limits (Brevo: 300/day free)
   - ✅ Easy to upgrade
   - ✅ Better monitoring

5. **Maintenance**
   - ✅ Update templates without rebuilding APK
   - ✅ Centralized email logic
   - ✅ Easier debugging

---

## Cost Analysis

### EmailJS (Client-Side)
- Free tier: 200 emails/month
- Paid: $15/month for 1,000 emails
- ⚠️ Credentials exposed in APK

### Brevo SMTP (Server-Side)
- Free tier: 300 emails/day (9,000/month)
- Paid: $25/month for 20,000 emails
- ✅ Secure, server-side only

**Recommendation:** Use Brevo (free tier is generous)

---

## Next Steps

### For Google Sign-In:
1. Run this command:
   ```bash
   eas credentials
   ```
2. Select your Android project
3. Copy the SHA-1 fingerprint
4. Share it with me or add to Firebase yourself

### For Email Notifications:
1. Decide: Quick fix (Solution 1) or Proper fix (Solution 2)?
2. If Solution 2:
   - Sign up for Brevo: https://www.brevo.com/
   - Get SMTP credentials
   - Let me know when ready to implement

---

## Questions?

1. **Do you want me to implement the email backend endpoint?**
   - I can create the complete backend notification system

2. **Do you have Brevo SMTP credentials?**
   - If not, I can guide you through signup

3. **Is your backend deployed and accessible?**
   - Need to know for testing email functionality

4. **Do you want both fixes implemented now?**
   - Or should we prioritize one over the other?

Let me know how you'd like to proceed!
