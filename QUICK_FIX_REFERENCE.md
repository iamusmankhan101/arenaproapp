# Quick Fix Reference Card

## 🚨 Two APK Issues to Fix

### Issue 1: Google Sign-In ❌
**Status:** Waiting for SHA-1 fingerprint  
**Time:** 15 minutes  
**Guide:** `GOOGLE_SIGNIN_APK_FIX_STEPS.md`

**Quick Steps:**
```bash
# 1. Get SHA-1
eas credentials

# 2. Add to Firebase Console → Android app → Add fingerprint
# 3. Download google-services.json
# 4. Replace in project root
# 5. Rebuild
eas build --platform android --profile production
```

---

### Issue 2: Email Notifications ❌
**Status:** Choose solution  
**Time:** 30 min (quick) or 1 hour (proper)  
**Guide:** `EMAIL_NOTIFICATIONS_IMPLEMENTATION_GUIDE.md`

**Option A: Quick Fix (30 min)**
- Bundle credentials in app.json
- Update email service to use expo-constants
- ⚠️ Security risk

**Option B: Proper Fix (1 hour) - RECOMMENDED**
- Use backend email service
- Sign up for Brevo SMTP (free)
- More secure and reliable

---

## 📋 Decision Needed

**For Email Notifications, which do you prefer?**

1. **Quick Fix** - Works fast but less secure
2. **Proper Fix** - Takes longer but production-ready

**Let me know and I'll implement it!**

---

## 🎯 What I Need From You

### For Google Sign-In:
- [ ] Run `eas credentials` and share SHA-1 fingerprint
- OR
- [ ] Add SHA-1 to Firebase yourself and confirm

### For Email Notifications:
- [ ] Choose Solution 1 (quick) or Solution 2 (proper)
- [ ] If Solution 2: Sign up for Brevo and share SMTP credentials

---

## 📞 Quick Commands

```bash
# Get EAS credentials
eas credentials

# Test backend email
node test-backend-email.js

# Build production APK
eas build --platform android --profile production

# Start backend
cd backend && npm start

# Start mobile app
npm start
```

---

## 📚 All Documentation Files

1. `APK_PRODUCTION_ISSUES_SUMMARY.md` - Complete overview
2. `GOOGLE_SIGNIN_APK_FIX_STEPS.md` - Google Sign-In fix
3. `FIX_EMAIL_NOTIFICATIONS_APK.md` - Email problem analysis
4. `EMAIL_NOTIFICATIONS_IMPLEMENTATION_GUIDE.md` - Email solutions
5. `QUICK_FIX_REFERENCE.md` - This file

---

## ⚡ Ready to Fix?

Just tell me:
1. Your SHA-1 fingerprint (for Google Sign-In)
2. Which email solution you want (1 or 2)

And I'll implement everything!
