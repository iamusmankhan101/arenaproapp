# APK Production Issues - Current Status

## Overview

Two critical issues preventing full APK functionality have been addressed with implementation-ready solutions.

---

## Issue 1: Google Sign-In ❌ → ⏳ Waiting for User Action

### Status: SOLUTION READY - Needs SHA-1 Fingerprint

### Problem
- Works in Expo Go ✅
- Fails in APK with Error 400 ❌
- Error: "Custom URI scheme is not enabled for your Android client"

### Root Cause
Production SHA-1 certificate fingerprint not registered in Firebase Console.

### Solution Steps
1. Run `eas credentials` to get production SHA-1
2. Add SHA-1 to Firebase Console (Android app settings)
3. Download updated `google-services.json`
4. Replace in project root
5. Rebuild APK

### Time Required
15 minutes

### Documentation
📄 `GOOGLE_SIGNIN_APK_FIX_STEPS.md`  
📄 `FIX_GOOGLE_SIGNIN_APK.md`

### What I Need From You
```bash
# Run this command and share the SHA-1 fingerprint:
eas credentials
```

---

## Issue 2: Email Notifications ✅ IMPLEMENTED

### Status: SOLUTION IMPLEMENTED - Needs SMTP Configuration

### Problem
- Works in development ✅
- Fails in APK (no emails sent) ❌
- Environment variables not bundled in production builds

### Root Cause
Client-side EmailJS credentials not accessible in production APK.

### Solution Implemented
✅ Backend email service with nodemailer  
✅ Professional HTML email templates  
✅ Secure server-side email sending  
✅ Frontend updated to use backend API  
✅ Test script created  

### Files Created/Modified
1. ✅ `backend/routes/notifications.js` - Email endpoints
2. ✅ `backend/server.js` - Registered routes
3. ✅ `src/services/emailService.js` - Updated to use backend
4. ✅ `test-backend-email.js` - Test script

### Next Steps Required
1. Sign up for Brevo SMTP (free tier - 300 emails/day)
2. Get SMTP credentials
3. Configure `backend/.env`
4. Test with `node test-backend-email.js`
5. Rebuild APK

### Time Required
10 minutes (signup + config) + 15 minutes (build APK)

### Documentation
📄 `BACKEND_EMAIL_SETUP_COMPLETE.md` - Complete setup guide  
📄 `EMAIL_NOTIFICATIONS_FIXED_SUMMARY.md` - Quick summary  
📄 `EMAIL_NOTIFICATIONS_IMPLEMENTATION_GUIDE.md` - Technical details

### What I Need From You
1. Sign up at https://www.brevo.com/
2. Get SMTP key from Settings → SMTP & API
3. Add to `backend/.env`:
   ```env
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_EMAIL=your-brevo-email@example.com
   SMTP_PASSWORD=xsmtpsib-your-key-here
   FROM_EMAIL=noreply@arenapro.pk
   FROM_NAME=Arena Pro
   ```

---

## Priority Action Plan

### Priority 1: Google Sign-In (Critical)
**Impact:** Users cannot sign in with Google  
**Time:** 15 minutes  
**Action:** Get SHA-1 fingerprint from `eas credentials`

### Priority 2: Email Notifications (Important)
**Impact:** Users don't get booking confirmations  
**Time:** 25 minutes  
**Action:** Sign up for Brevo and configure SMTP

---

## Testing Checklist

### Google Sign-In Testing
- [ ] Get SHA-1 from `eas credentials`
- [ ] Add SHA-1 to Firebase Console
- [ ] Download updated `google-services.json`
- [ ] Replace in project root
- [ ] Rebuild APK: `eas build --platform android --profile production`
- [ ] Install APK on device
- [ ] Test Google Sign-In
- [ ] Verify user profile loads

### Email Notifications Testing
- [ ] Sign up for Brevo
- [ ] Get SMTP credentials
- [ ] Configure `backend/.env`
- [ ] Test: `node test-backend-email.js`
- [ ] Start backend: `cd backend && npm start`
- [ ] Start mobile app: `npm start`
- [ ] Make test booking
- [ ] Check email inbox
- [ ] Rebuild APK
- [ ] Test email in production APK

---

## Quick Commands

```bash
# Get SHA-1 fingerprint for Google Sign-In
eas credentials

# Test backend email service
node test-backend-email.js

# Start backend server
cd backend && npm start

# Start mobile app
npm start

# Build production APK
eas build --platform android --profile production

# Check backend health
curl http://localhost:3001/health
```

---

## Documentation Index

### Google Sign-In
1. `GOOGLE_SIGNIN_APK_FIX_STEPS.md` - Step-by-step fix guide
2. `FIX_GOOGLE_SIGNIN_APK.md` - Problem analysis

### Email Notifications
1. `BACKEND_EMAIL_SETUP_COMPLETE.md` - Complete setup guide ⭐
2. `EMAIL_NOTIFICATIONS_FIXED_SUMMARY.md` - Quick summary
3. `EMAIL_NOTIFICATIONS_IMPLEMENTATION_GUIDE.md` - Technical details
4. `FIX_EMAIL_NOTIFICATIONS_APK.md` - Problem analysis

### General
1. `APK_PRODUCTION_ISSUES_SUMMARY.md` - Complete overview
2. `QUICK_FIX_REFERENCE.md` - Quick reference card
3. `APK_ISSUES_STATUS.md` - This file

---

## Current Status Summary

| Issue | Status | Implementation | Testing | Production |
|-------|--------|----------------|---------|------------|
| Google Sign-In | ⏳ Waiting | ✅ Ready | ⏳ Pending | ❌ Not Working |
| Email Notifications | ✅ Implemented | ✅ Complete | ⏳ Pending | ⏳ Needs Config |

---

## What Happens Next?

### Scenario 1: You Provide SHA-1 Fingerprint
1. I'll guide you through Firebase Console setup
2. You download updated `google-services.json`
3. Rebuild APK
4. Google Sign-In works! ✅

### Scenario 2: You Configure Brevo SMTP
1. Test email with `node test-backend-email.js`
2. Start backend and test in mobile app
3. Rebuild APK
4. Email notifications work! ✅

### Scenario 3: You Do Both
1. Complete both fixes
2. Rebuild APK once
3. Both features work perfectly! ✅✅

---

## Estimated Timeline

### If Starting Now:

**Google Sign-In:**
- Get SHA-1: 2 minutes
- Firebase setup: 5 minutes
- Download google-services.json: 1 minute
- Rebuild APK: 15 minutes
- **Total: ~23 minutes**

**Email Notifications:**
- Brevo signup: 5 minutes
- Get SMTP key: 2 minutes
- Configure backend: 2 minutes
- Test email: 1 minute
- Rebuild APK: 15 minutes (can combine with above)
- **Total: ~25 minutes**

**Both Issues Combined:**
- Setup: ~15 minutes
- Build APK: 15 minutes (one build for both)
- **Total: ~30 minutes**

---

## Ready to Fix?

Just let me know:

1. **For Google Sign-In:** Share your SHA-1 fingerprint from `eas credentials`
2. **For Email Notifications:** Share your Brevo SMTP credentials

I'll guide you through the rest! 🚀

---

## Questions?

- Need help with Brevo signup? Check `BACKEND_EMAIL_SETUP_COMPLETE.md`
- Need help with Firebase? Check `GOOGLE_SIGNIN_APK_FIX_STEPS.md`
- Need help with EAS? Check `EAS_BUILD_GUIDE.md`

All documentation is ready and waiting for you!
