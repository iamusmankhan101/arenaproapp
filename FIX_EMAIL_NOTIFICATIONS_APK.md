# Fix Email Notifications Not Working in APK

## Problem
Email notifications work in Expo Go development but fail in production APK builds.

## Root Cause Analysis

### Current Implementation
The app uses **EmailJS** (client-side email service) to send booking confirmation emails:
- Service: `src/services/emailService.js`
- Used in: `src/screens/booking/BookingConfirmScreen.js`
- Configuration: Environment variables in `.env` file

### Why It Fails in APK

1. **Environment Variables Not Bundled**
   - `.env` files are NOT automatically included in production builds
   - `process.env.EXPO_PUBLIC_*` variables need special handling in Expo
   - Variables must be defined in `app.json` extra config OR accessed differently

2. **Network/CORS Issues**
   - EmailJS API calls may be blocked in production
   - Network security policies differ between dev and production
   - HTTPS certificate validation stricter in APK

3. **Client-Side Email Limitations**
   - EmailJS credentials exposed in client code (security risk)
   - Rate limiting on free tier
   - Less reliable than server-side email

## Solution Options

### Option 1: Fix Environment Variables (Quick Fix)

Add EmailJS credentials to `app.json` so they're bundled in the APK:

```json
{
  "expo": {
    "extra": {
      "emailjs": {
        "serviceId": "service_fbv2xpl",
        "templateId": "template_rvzdkla",
        "userId": "DeOJhRm2vDyqLXLIN"
      }
    }
  }
}
```

Then update `src/services/emailService.js` to read from `expo-constants`:

```javascript
import Constants from 'expo-constants';

const sendEmailJS = async (templateParams, specificTemplateId = null) => {
    const serviceId = Constants.expoConfig?.extra?.emailjs?.serviceId;
    const templateId = specificTemplateId || Constants.expoConfig?.extra?.emailjs?.templateId;
    const userId = Constants.expoConfig?.extra?.emailjs?.userId;
    
    // Rest of the code...
}
```

**Pros:**
- Quick fix
- Minimal code changes

**Cons:**
- Credentials still exposed in APK (can be extracted)
- Still relies on client-side email service
- May still have network issues

---

### Option 2: Move to Backend Email Service (Recommended)

Use the existing backend nodemailer implementation instead of client-side EmailJS.

#### Backend Already Has Email Service!
File: `backend/utils/sendEmail.js` (exists in your project)

#### Steps:

1. **Create Backend Email Endpoint**

Create `backend/routes/notifications.js`:

```javascript
const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');
const auth = require('../middleware/auth');

// Send booking confirmation email
router.post('/booking-confirmation', auth, async (req, res) => {
  try {
    const { bookingDetails, userEmail, userName } = req.body;
    
    const emailContent = `
      <h2>Booking Confirmed!</h2>
      <p>Dear ${userName},</p>
      <p>Your booking has been confirmed. Here are the details:</p>
      <ul>
        <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
        <li><strong>Venue:</strong> ${bookingDetails.turfName}</li>
        <li><strong>Date:</strong> ${bookingDetails.date}</li>
        <li><strong>Time:</strong> ${bookingDetails.timeSlot}</li>
        <li><strong>Amount:</strong> PKR ${bookingDetails.totalAmount}</li>
        <li><strong>Location:</strong> ${bookingDetails.turfAddress}</li>
      </ul>
      <p>Thank you for choosing Arena Pro!</p>
    `;
    
    await sendEmail({
      to: userEmail,
      subject: `Booking Confirmed! - ${bookingDetails.turfName}`,
      html: emailContent
    });
    
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

2. **Register Route in Backend**

Add to `backend/server.js`:

```javascript
const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);
```

3. **Update Frontend Email Service**

Replace `src/services/emailService.js` with backend API calls:

```javascript
import { API_URL } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const emailService = {
  sendBookingConfirmation: async (details, user) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/api/notifications/booking-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingDetails: details,
          userEmail: user.email,
          userName: user.name || user.fullName
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Email sent successfully');
        return { success: true };
      } else {
        console.error('❌ Email failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Email network error:', error);
      return { success: false, error: error.message };
    }
  }
};
```

**Pros:**
- ✅ Secure (credentials on server only)
- ✅ More reliable
- ✅ Works in all environments
- ✅ No CORS issues
- ✅ Backend already has nodemailer setup

**Cons:**
- Requires backend to be running
- More setup work

---

### Option 3: Use Firebase Cloud Functions (Alternative)

If you want to keep emails serverless, use Firebase Cloud Functions:

1. Create a Cloud Function to send emails
2. Trigger from app using Firebase SDK
3. Configure email service in Cloud Function

**Pros:**
- Serverless
- Secure
- Scalable

**Cons:**
- Requires Firebase Blaze plan (paid)
- Additional Firebase setup

---

## Recommended Approach

**Use Option 2 (Backend Email Service)** because:

1. Your backend already has `sendEmail.js` utility
2. More secure than client-side email
3. Works reliably in production
4. No additional costs
5. Better control over email templates

## Implementation Steps

### Step 1: Install expo-constants (if not already installed)

```bash
npx expo install expo-constants
```

### Step 2: Choose Your Solution

**For Quick Fix (Option 1):**
- Update `app.json` with EmailJS credentials
- Update `emailService.js` to use Constants
- Rebuild APK

**For Proper Fix (Option 2):**
- Create backend notification endpoint
- Update frontend email service
- Test backend email sending
- Rebuild APK

### Step 3: Test Email Functionality

1. **Test in Development:**
   ```bash
   npm start
   ```

2. **Test Backend Email (if using Option 2):**
   - Start backend: `cd backend && npm start`
   - Make a test booking
   - Check email delivery

3. **Build and Test APK:**
   ```bash
   eas build --platform android --profile production
   ```

4. **Install APK and test:**
   - Make a booking
   - Check if email is received
   - Check console logs for errors

## Debugging Tips

### Check Environment Variables in APK

Add debug logging in `emailService.js`:

```javascript
console.log('📧 EmailJS Config:', {
  serviceId: serviceId ? 'SET' : 'MISSING',
  templateId: templateId ? 'SET' : 'MISSING',
  userId: userId ? 'SET' : 'MISSING'
});
```

### Check Network Requests

Add network logging:

```javascript
console.log('📤 Sending email request to:', EMAILJS_API_URL);
console.log('📦 Payload:', JSON.stringify(payload, null, 2));
```

### Test Backend Email Directly

Create a test script `test-backend-email.js`:

```javascript
const sendEmail = require('./backend/utils/sendEmail');

sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Test</h1>'
}).then(() => {
  console.log('✅ Email sent');
}).catch(err => {
  console.error('❌ Email failed:', err);
});
```

## Current Configuration

Your `.env` file has:
```
EXPO_PUBLIC_EMAILJS_SERVICE_ID=service_fbv2xpl
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=template_rvzdkla
EXPO_PUBLIC_EMAILJS_USER_ID=DeOJhRm2vDyqLXLIN
```

These are NOT automatically bundled into production builds!

## Next Steps

1. **Decide which solution to implement** (Option 1 or 2)
2. **Let me know your choice** and I'll implement it
3. **Test in development** before building APK
4. **Rebuild APK** with fixes
5. **Test email notifications** in production APK

## Questions to Answer

1. Do you want the quick fix (Option 1) or proper backend solution (Option 2)?
2. Is your backend currently deployed and accessible from the app?
3. Do you have access to backend email configuration (SMTP settings)?

Let me know which approach you'd like to take!
