# SpaceMail Setup Guide for Arena Pro

## Overview

SpaceMail is your chosen email service provider for Arena Pro. This guide will help you set it up with your backend.

## Step 1: Get SpaceMail Credentials

### Option A: If you already have a SpaceMail account

1. Log in to your SpaceMail dashboard
2. Go to **Settings** or **SMTP Configuration**
3. Find your SMTP credentials:
   - SMTP Host (usually `smtp.spacemail.com`)
   - SMTP Port (usually `587` or `465`)
   - SMTP Username/Email
   - SMTP Password/API Key

### Option B: If you need to create a SpaceMail account

1. Go to https://spacemail.com (or your SpaceMail provider's website)
2. Sign up for an account
3. Verify your email address
4. Complete domain verification (if using custom domain)
5. Navigate to SMTP settings to get your credentials

## Step 2: Configure Backend

### Update backend/.env

Open `backend/.env` and add your SpaceMail credentials:

```env
# SpaceMail SMTP Configuration
SMTP_HOST=smtp.spacemail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@yourdomain.com
SMTP_PASSWORD=your-spacemail-password
FROM_EMAIL=no-reply@arenapro.com
FROM_NAME=Arena Pro
```

### Configuration Details

**SMTP_HOST**: 
- Usually `smtp.spacemail.com`
- Check your SpaceMail dashboard for the exact host

**SMTP_PORT**:
- `587` - TLS (recommended)
- `465` - SSL
- `25` - Unencrypted (not recommended)

**SMTP_EMAIL**:
- Your SpaceMail account email
- Or your verified sender email

**SMTP_PASSWORD**:
- Your SpaceMail password
- Or API key (if SpaceMail provides one)

**FROM_EMAIL**:
- The email address that appears in the "From" field
- Must be verified in SpaceMail
- Can be different from SMTP_EMAIL

**FROM_NAME**:
- The name that appears in the "From" field
- Example: "Arena Pro", "Arena Pro Support", etc.

## Step 3: Verify Domain (Optional but Recommended)

For better deliverability, verify your domain in SpaceMail:

1. Log in to SpaceMail dashboard
2. Go to **Domain Settings** or **Sender Verification**
3. Add your domain (e.g., `arenapro.com`)
4. Add the provided DNS records to your domain:
   - SPF record
   - DKIM record
   - DMARC record (optional)
5. Wait for verification (usually 24-48 hours)

### Example DNS Records

**SPF Record** (TXT):
```
v=spf1 include:spacemail.com ~all
```

**DKIM Record** (TXT):
```
k=rsa; p=YOUR_PUBLIC_KEY_FROM_SPACEMAIL
```

**DMARC Record** (TXT):
```
v=DMARC1; p=none; rua=mailto:dmarc@arenapro.com
```

## Step 4: Test Email Setup

Run the test script to verify everything is working:

```bash
node test-backend-email-setup.js
```

Expected output:
```
🧪 Testing Backend Email Setup...

📋 Checking Environment Variables:
   SMTP_HOST: ✅ SET
   SMTP_PORT: ✅ SET
   SMTP_EMAIL: ✅ SET
   SMTP_PASSWORD: ✅ SET
   FROM_EMAIL: ✅ SET
   FROM_NAME: ✅ SET

🔌 Testing SMTP Connection...
✅ SMTP Connection Successful!

📧 Sending Test Email to your-email@yourdomain.com...
✅ Test Email Sent Successfully!
   Message ID: <abc123@spacemail.com>

🎉 Email Service Setup Complete!
```

## Step 5: Start Backend

```bash
cd backend
npm start
```

Your backend is now ready to send emails through SpaceMail!

## SpaceMail Features

### Advantages
- ✅ Professional email service
- ✅ Good deliverability rates
- ✅ Custom domain support
- ✅ Detailed analytics
- ✅ Bounce and complaint handling
- ✅ Template management (if supported)

### Typical Limits
- Check your SpaceMail plan for specific limits
- Free tier: Usually 100-1000 emails/month
- Paid plans: Higher limits or unlimited

## Troubleshooting

### Connection Failed

**Error**: `SMTP Connection Failed`

**Solutions**:
1. Verify SMTP_HOST is correct (check SpaceMail dashboard)
2. Check SMTP_PORT (try 587, 465, or 25)
3. Verify credentials are correct
4. Check if your IP is whitelisted (if required)
5. Ensure firewall allows outbound SMTP connections

### Authentication Failed

**Error**: `Authentication failed` or `Invalid credentials`

**Solutions**:
1. Double-check SMTP_EMAIL and SMTP_PASSWORD
2. Check if you need to use an API key instead of password
3. Verify your SpaceMail account is active
4. Check if 2FA is enabled (may need app password)

### Emails Not Delivered

**Issue**: Emails sent but not received

**Solutions**:
1. Check spam folder
2. Verify FROM_EMAIL is verified in SpaceMail
3. Check SpaceMail dashboard for delivery status
4. Verify domain DNS records (SPF, DKIM)
5. Check recipient email is valid

### Rate Limit Exceeded

**Error**: `Rate limit exceeded` or `Too many requests`

**Solutions**:
1. Check your SpaceMail plan limits
2. Upgrade to higher tier if needed
3. Implement email queuing in your app
4. Space out email sending

## Email Types Sent by Arena Pro

Your app will send these emails through SpaceMail:

### 1. Booking Confirmations
- Sent when user completes a booking
- Includes venue, date, time, amount

### 2. Squad Builder Notifications
- Player joined game (to organizer)
- Join confirmation (to player)
- Game cancelled (to participants)

### 3. Challenge Notifications
- Challenge accepted (to creator)
- Challenge updates

## Monitoring Email Delivery

### SpaceMail Dashboard
- Log in to SpaceMail dashboard
- Check **Email Activity** or **Logs**
- Monitor:
  - Sent emails
  - Delivered emails
  - Bounces
  - Complaints
  - Opens (if tracking enabled)
  - Clicks (if tracking enabled)

### Backend Logs
Check your backend console for email logs:
```
📧 Backend: Sending email to user@example.com...
✅ Backend: Email sent: <message-id>
```

## Production Best Practices

### 1. Use Custom Domain
- Set up `no-reply@arenapro.com` instead of generic email
- Verify domain in SpaceMail
- Add SPF, DKIM, DMARC records

### 2. Monitor Deliverability
- Check bounce rates (should be < 5%)
- Monitor complaint rates (should be < 0.1%)
- Review SpaceMail analytics regularly

### 3. Handle Bounces
- Implement bounce handling in your app
- Remove invalid emails from database
- Update user records

### 4. Implement Email Queue
- For high volume, use a queue (Bull, BullMQ)
- Prevents rate limit issues
- Better error handling

### 5. Test Before Production
- Send test emails to multiple providers (Gmail, Outlook, Yahoo)
- Check spam scores
- Verify all links work
- Test on mobile and desktop

## Cost Optimization

### Tips to Reduce Email Costs
1. Only send necessary emails
2. Batch similar emails
3. Use in-app notifications for non-critical updates
4. Implement email preferences (let users opt-out)
5. Clean email list regularly

## Support

### SpaceMail Support
- Check SpaceMail documentation
- Contact SpaceMail support team
- Check community forums

### Arena Pro Email Issues
- Check backend logs
- Run test script: `node test-backend-email-setup.js`
- Verify `.env` configuration
- See `BACKEND_EMAIL_SETUP_GUIDE.md` for general troubleshooting

## Next Steps

1. ✅ Get SpaceMail credentials
2. ✅ Update `backend/.env` with credentials
3. ✅ Run test script to verify setup
4. ✅ Start backend server
5. ✅ Test Squad Builder email flow
6. ✅ Verify domain for better deliverability
7. ✅ Monitor email delivery in SpaceMail dashboard

---

**Status**: Ready to configure with your SpaceMail credentials

**Last Updated**: February 25, 2026
