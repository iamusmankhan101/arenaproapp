# Backend Email Service Setup Guide

## Overview

Your app now uses a **backend email service** with Nodemailer instead of EmailJS. This provides better control, security, and no email limits (depends on your SMTP provider).

## What Changed

### Before (EmailJS)
- Emails sent directly from mobile app
- Required EmailJS credentials in `app.json`
- Limited to 200 emails/month (free tier)
- Credentials exposed in APK

### After (Backend + Nodemailer)
- Emails sent through your backend server
- SMTP credentials stored securely on server
- No email limits (depends on SMTP provider)
- More professional and secure

## Setup Instructions

### Step 1: Choose Your SMTP Provider

#### Option A: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Security > 2-Step Verification > Turn On

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Arena Pro Backend"
   - Copy the 16-character password

3. **Update backend/.env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-app-password
   FROM_EMAIL=your-email@gmail.com
   FROM_NAME=Arena Pro
   ```

**Gmail Limits:**
- 500 emails per day (free)
- 2000 emails per day (Google Workspace)

#### Option B: Brevo/Sendinblue (Recommended for Production)

1. **Sign Up**
   - Go to https://www.brevo.com
   - Create a free account

2. **Get SMTP Credentials**
   - Go to Settings > SMTP & API
   - Copy your SMTP key (starts with "xsmtpsib-")

3. **Update backend/.env**
   ```env
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_EMAIL=your-brevo-login-email@example.com
   SMTP_PASSWORD=your-xs-smtp-key
   FROM_EMAIL=no-reply@arenapro.com
   FROM_NAME=Arena Pro
   ```

**Brevo Limits:**
- 300 emails per day (free)
- Unlimited with paid plans

### Step 2: Configure Backend

1. **Copy .env.example to .env**
   ```bash
   cd backend
   copy .env.example .env
   ```

2. **Edit backend/.env**
   - Add your SMTP credentials from Step 1
   - Update other settings as needed

3. **Restart Backend Server**
   ```bash
   npm start
   ```

### Step 3: Test Email Sending

Run this test script to verify emails are working:

```bash
node test-backend-email.js
```

You should see:
```
✅ Backend: Email sent: <message-id>
```

## Email Types Implemented

### 1. Booking Confirmation
- Sent when user completes a booking
- Includes venue, date, time, amount, location

### 2. Challenge Acceptance
- Sent to challenge creator when someone accepts
- Includes challenge details and acceptor team

### 3. Squad Builder - Player Joined
- Sent to organizer when someone joins their game
- Includes player name and current player count

### 4. Squad Builder - Join Confirmation
- Sent to player when they join a game
- Includes game details and their share amount

### 5. Squad Builder - Game Cancelled
- Sent to all participants when organizer cancels
- Includes game details and cancellation notice

## API Endpoints

All endpoints require authentication (auth middleware).

### POST /api/notifications/booking-confirmation
```json
{
  "bookingDetails": {
    "bookingId": "string",
    "turfName": "string",
    "date": "string",
    "timeSlot": "string",
    "totalAmount": "number",
    "turfAddress": "string"
  },
  "userEmail": "string",
  "userName": "string"
}
```

### POST /api/notifications/squad-player-joined
```json
{
  "gameDetails": {
    "turfName": "string",
    "dateTime": "ISO date string",
    "startTime": "string",
    "endTime": "string",
    "currentPlayers": "number",
    "totalPlayers": "number"
  },
  "organizerEmail": "string",
  "organizerName": "string",
  "playerName": "string"
}
```

### POST /api/notifications/squad-join-confirmation
```json
{
  "gameDetails": {
    "turfName": "string",
    "dateTime": "ISO date string",
    "startTime": "string",
    "endTime": "string",
    "pricePerPlayer": "number",
    "currentPlayers": "number",
    "totalPlayers": "number",
    "organizerName": "string"
  },
  "playerEmail": "string",
  "playerName": "string"
}
```

### POST /api/notifications/squad-game-cancelled
```json
{
  "gameDetails": {
    "turfName": "string",
    "dateTime": "ISO date string",
    "startTime": "string",
    "endTime": "string",
    "organizerName": "string"
  },
  "participantEmail": "string",
  "participantName": "string"
}
```

## Troubleshooting

### Emails Not Sending

1. **Check Backend Logs**
   ```
   📧 Backend: Sending email to user@example.com...
   ✅ Backend: Email sent: <message-id>
   ```

2. **Verify SMTP Credentials**
   - Make sure `.env` file exists in `backend/` folder
   - Check credentials are correct
   - For Gmail, use app password (not regular password)

3. **Check Spam Folder**
   - Emails might be in spam initially
   - Mark as "Not Spam" to improve deliverability

4. **Test SMTP Connection**
   ```bash
   node test-backend-email.js
   ```

### Gmail "Less Secure Apps" Error

Gmail no longer supports "less secure apps". You MUST use an app password:
1. Enable 2-factor authentication
2. Generate app password
3. Use the 16-character app password in `.env`

### Brevo Rate Limits

Free tier: 300 emails/day
- If you hit the limit, emails will fail
- Upgrade to paid plan or wait 24 hours
- Check your Brevo dashboard for usage

## Production Deployment

### Recommended Setup

1. **Use Brevo or AWS SES** (not Gmail)
2. **Set up custom domain** for FROM_EMAIL
3. **Configure SPF and DKIM** records
4. **Monitor email delivery** rates
5. **Set up email templates** in your SMTP provider

### Environment Variables

Make sure these are set in your production environment:
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_EMAIL=your-email@example.com
SMTP_PASSWORD=your-smtp-key
FROM_EMAIL=no-reply@yourdomain.com
FROM_NAME=Arena Pro
```

## Benefits of Backend Email Service

✅ **Security**: SMTP credentials never exposed in mobile app
✅ **Scalability**: No email limits (depends on provider)
✅ **Control**: Full control over email templates and logic
✅ **Professional**: Use your own domain email
✅ **Reliability**: Better deliverability rates
✅ **Cost**: Free tier available, cheaper at scale

## Next Steps

1. Set up SMTP credentials (Gmail or Brevo)
2. Test email sending with test script
3. Deploy backend with email configuration
4. Monitor email delivery in production
5. Consider upgrading to paid SMTP plan for production

## Support

If you encounter issues:
1. Check backend logs for error messages
2. Verify SMTP credentials are correct
3. Test with the provided test script
4. Check your SMTP provider's dashboard for delivery status
