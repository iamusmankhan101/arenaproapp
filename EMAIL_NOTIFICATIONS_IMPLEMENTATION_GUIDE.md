# Email Notifications Implementation Guide

## Current Status

✅ **Backend email utility exists:** `backend/utils/sendEmail.js` (using nodemailer + Brevo SMTP)  
✅ **Frontend email service exists:** `src/services/emailService.js` (using EmailJS)  
❌ **Problem:** EmailJS doesn't work in production APK (environment variables not bundled)

## Two Solutions Available

### Solution 1: Quick Fix - Fix EmailJS in APK (30 minutes)
### Solution 2: Proper Fix - Use Backend Email Service (1 hour)

---

## Solution 1: Quick Fix - Fix EmailJS in APK

### What This Does
Makes EmailJS work in production APK by properly bundling environment variables.

### Pros & Cons
✅ Quick to implement  
✅ No backend changes needed  
❌ Credentials exposed in APK (security risk)  
❌ Client-side email less reliable  
❌ EmailJS rate limits on free tier  

### Implementation Steps

#### Step 1: Install expo-constants

```bash
npx expo install expo-constants
```

#### Step 2: Update app.json

Add EmailJS credentials to `extra` config:

```json
{
  "expo": {
    "name": "Arena Pro",
    "extra": {
      "emailjs": {
        "serviceId": "service_fbv2xpl",
        "templateId": "template_rvzdkla",
        "userId": "DeOJhRm2vDyqLXLIN"
      },
      "eas": {
        "projectId": "3e7192c7-524e-4146-801c-3960363da458"
      }
    }
  }
}
```

#### Step 3: Update src/services/emailService.js

Replace the top of the file:

```javascript
import Constants from 'expo-constants';

const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

// Helper to send email via EmailJS REST API
const sendEmailJS = async (templateParams, specificTemplateId = null) => {
    // Get credentials from expo-constants (bundled in APK)
    const serviceId = Constants.expoConfig?.extra?.emailjs?.serviceId;
    const templateId = specificTemplateId || Constants.expoConfig?.extra?.emailjs?.templateId;
    const userId = Constants.expoConfig?.extra?.emailjs?.userId;

    // Debug logging
    console.log('📧 EmailJS Config Check:', {
        serviceId: serviceId ? '✅ SET' : '❌ MISSING',
        templateId: templateId ? '✅ SET' : '❌ MISSING',
        userId: userId ? '✅ SET' : '❌ MISSING'
    });

    if (!serviceId || !templateId || !userId) {
        console.warn('⚠️ EmailJS: Missing configuration. Emails will not be sent.');
        console.warn('⚠️ Check app.json extra.emailjs configuration');
        return { success: false, error: 'Missing configuration' };
    }

    const payload = {
        service_id: serviceId,
        template_id: templateId,
        user_id: userId,
        template_params: templateParams
    };

    try {
        console.log('📤 EmailJS: Sending request to:', EMAILJS_API_URL);
        
        const response = await fetch(EMAILJS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('✅ EmailJS: Email sent successfully!');
            return { success: true };
        } else {
            const errorText = await response.text();
            console.error('❌ EmailJS: Failed to send email:', errorText);
            return { success: false, error: errorText };
        }
    } catch (error) {
        console.error('❌ EmailJS: Network error:', error);
        return { success: false, error: error.message };
    }
};

// Rest of the file stays the same...
```

#### Step 4: Test and Build

```bash
# Test in development
npm start

# Build APK
eas build --platform android --profile production

# Test in APK
# Install APK, make a booking, check email
```

---

## Solution 2: Proper Fix - Use Backend Email Service (RECOMMENDED)

### What This Does
Moves email sending to backend using nodemailer (more secure and reliable).

### Pros & Cons
✅ Secure (credentials on server only)  
✅ More reliable  
✅ No rate limits  
✅ Works in all environments  
✅ Backend already has nodemailer setup  
❌ Requires backend to be running  
❌ More setup work  

### Implementation Steps

#### Step 1: Configure Backend Email (Brevo SMTP)

1. **Sign up for Brevo (free tier):**
   - Go to https://www.brevo.com/
   - Sign up for free account
   - Verify your email

2. **Get SMTP credentials:**
   - Go to Settings → SMTP & API
   - Create SMTP key
   - Copy the key (starts with "xsmtpsib-...")

3. **Update backend/.env:**

```env
# Email Configuration (Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_EMAIL=your-brevo-login-email@example.com
SMTP_PASSWORD=xsmtpsib-your-smtp-key-here
FROM_EMAIL=noreply@arenapro.pk
FROM_NAME=Arena Pro
```

#### Step 2: Create Backend Notification Routes

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
    
    if (!userEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'User email is required' 
      });
    }
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #004d43; color: #e8ee26; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${userName || 'Valued Customer'},</p>
            <p>Your booking has been confirmed successfully. Here are your booking details:</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="label">Booking ID:</span>
                <span class="value">${bookingDetails.bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Venue:</span>
                <span class="value">${bookingDetails.turfName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${bookingDetails.date}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${bookingDetails.timeSlot}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value">PKR ${bookingDetails.totalAmount}</span>
              </div>
              <div class="detail-row">
                <span class="label">Location:</span>
                <span class="value">${bookingDetails.turfAddress}</span>
              </div>
            </div>
            
            <p><strong>Important:</strong> Please arrive 10 minutes before your scheduled time.</p>
            <p>If you have any questions, feel free to contact the venue directly.</p>
            <p>Thank you for choosing Arena Pro!</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; 2024 Arena Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const result = await sendEmail({
      email: userEmail,
      subject: `Booking Confirmed! - ${bookingDetails.turfName}`,
      message: emailContent
    });
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Failed to send email' 
      });
    }
  } catch (error) {
    console.error('❌ Email notification error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
```

#### Step 3: Register Route in Backend

Update `backend/server.js` - add this line with other routes:

```javascript
// Import notification routes
const notificationRoutes = require('./routes/notifications');

// Register routes
app.use('/api/notifications', notificationRoutes);
```

#### Step 4: Update Frontend Email Service

Replace `src/services/emailService.js` completely:

```javascript
import { API_URL } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const emailService = {
  /**
   * Sends a booking confirmation email via backend
   * @param {Object} details - Booking details
   * @param {Object} user - User details
   */
  sendBookingConfirmation: async (details, user) => {
    try {
      console.log('📧 Sending Booking Confirmation via Backend...');
      
      // Get auth token
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.warn('⚠️ No auth token found, skipping email');
        return { success: false, error: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/api/notifications/booking-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingDetails: {
            bookingId: details.bookingId,
            turfName: details.turfName,
            date: details.date,
            timeSlot: details.timeSlot,
            totalAmount: details.totalAmount,
            turfAddress: details.turfAddress
          },
          userEmail: user.email,
          userName: user.name || user.fullName || user.displayName
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Email sent successfully via backend');
        return { success: true };
      } else {
        console.error('❌ Backend email failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Email service error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Sends a challenge acceptance email to the Creator
   * @param {Object} challenge - Challenge details
   * @param {Object} acceptorTeam - Team accepting the challenge
   * @param {Object} creator - Creator details
   */
  sendChallengeAcceptanceToCreator: async (challenge, acceptorTeam, creator) => {
    // TODO: Implement backend endpoint for challenge emails
    console.log('📧 Challenge email not yet implemented on backend');
    return { success: false, error: 'Not implemented' };
  },

  /**
   * Sends a challenge joined confirmation to the Acceptor
   * @param {Object} challenge - Challenge details
   * @param {Object} user - Acceptor user details
   */
  sendChallengeJoinConfirmation: async (challenge, user) => {
    // TODO: Implement backend endpoint for challenge emails
    console.log('📧 Challenge email not yet implemented on backend');
    return { success: false, error: 'Not implemented' };
  }
};
```

#### Step 5: Test Backend Email

Create `test-backend-email.js` in project root:

```javascript
require('dotenv').config({ path: './backend/.env' });
const sendEmail = require('./backend/utils/sendEmail');

async function testEmail() {
  console.log('🧪 Testing backend email service...');
  
  const result = await sendEmail({
    email: 'your-test-email@example.com', // Replace with your email
    subject: 'Test Email from Arena Pro',
    message: `
      <h1>Test Email</h1>
      <p>If you receive this, email service is working!</p>
      <p>Sent at: ${new Date().toLocaleString()}</p>
    `
  });
  
  if (result.success) {
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
  } else {
    console.error('❌ Test email failed:', result.error);
  }
}

testEmail();
```

Run test:

```bash
node test-backend-email.js
```

#### Step 6: Start Backend and Test

```bash
# Start backend
cd backend
npm start

# In another terminal, start mobile app
npm start

# Make a test booking and check email
```

#### Step 7: Build and Test APK

```bash
# Build APK
eas build --platform android --profile production

# Install and test
# Make a booking, check if email arrives
```

---

## Comparison Table

| Feature | Solution 1 (EmailJS) | Solution 2 (Backend) |
|---------|---------------------|---------------------|
| Setup Time | 30 minutes | 1 hour |
| Security | ❌ Credentials in APK | ✅ Secure |
| Reliability | ⚠️ Medium | ✅ High |
| Rate Limits | ⚠️ Yes (free tier) | ✅ No limits |
| Backend Required | ❌ No | ✅ Yes |
| Production Ready | ⚠️ Not recommended | ✅ Recommended |
| Cost | Free (limited) | Free (Brevo 300/day) |

---

## Recommendation

**Use Solution 2 (Backend Email Service)** because:

1. ✅ Your backend already has nodemailer setup
2. ✅ More secure (no credentials in APK)
3. ✅ More reliable for production
4. ✅ No rate limits
5. ✅ Better email templates (HTML)
6. ✅ Easier to maintain and debug

---

## Next Steps

**Choose your solution:**

1. **Quick Fix (Solution 1):** If you need it working ASAP and don't mind security trade-offs
2. **Proper Fix (Solution 2):** If you want production-ready, secure email notifications

Let me know which solution you want to implement, and I'll help you set it up!

## Questions?

- Do you have Brevo SMTP credentials already?
- Is your backend deployed and accessible?
- Do you want me to implement Solution 2 for you?
