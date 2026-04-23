# Quick Start: Backend Email Service

## 🚀 5-Minute Setup with SpaceMail

### Step 1: Get SpaceMail Credentials (2 minutes)

1. Log in to your SpaceMail dashboard
2. Go to **Settings** > **SMTP Configuration**
3. Copy your credentials:
   - SMTP Host (usually `smtp.spacemail.com`)
   - SMTP Port (usually `587`)
   - SMTP Email/Username
   - SMTP Password/API Key

### Step 2: Configure Backend (1 minute)

1. Open `backend/.env` (create if doesn't exist)
2. Add these lines:

```env
SMTP_HOST=smtp.spacemail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@yourdomain.com
SMTP_PASSWORD=your-spacemail-password
FROM_EMAIL=no-reply@arenapro.com
FROM_NAME=Arena Pro
```

Replace with your actual SpaceMail credentials.

### Step 3: Test (1 minute)

```bash
node test-backend-email-setup.js
```

You should see:
```
✅ SMTP Connection Successful!
✅ Test Email Sent Successfully!
```

Check your inbox for the test email!

### Step 4: Start Backend (1 minute)

```bash
cd backend
npm start
```

### Done! ✅

Your app now sends emails through SpaceMail.

---

## Alternative: Gmail Setup (For Testing Only)

### Step 1: Get Gmail App Password (2 minutes)

1. Go to https://myaccount.google.com/apppasswords
2. Sign in to your Gmail account
3. If you don't see the page, enable 2-factor authentication first
4. Select "Mail" and "Other (Custom name)"
5. Name it "Arena Pro Backend"
6. Click "Generate"
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Configure Backend (1 minute)

1. Open `backend/.env` (create if doesn't exist)
2. Add these lines:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Arena Pro
```

Replace:
- `your-email@gmail.com` with your Gmail address
- `abcd efgh ijkl mnop` with your app password

### Step 3: Test (1 minute)

```bash
node test-backend-email-setup.js
```

You should see:
```
✅ SMTP Connection Successful!
✅ Test Email Sent Successfully!
```

Check your inbox for the test email!

### Step 4: Start Backend (1 minute)

```bash
cd backend
npm start
```

### Done! ✅

Your app now sends emails through the backend.

---

## 📧 What Emails Are Sent?

### Squad Builder:
- ✅ Player joins game → Email to organizer
- ✅ Player joins game → Email to player
- ✅ Game cancelled → Email to all participants

### Bookings:
- ✅ Booking confirmed → Email to customer

### Challenges:
- ✅ Challenge accepted → Email to creator

## 🔧 Troubleshooting

### SpaceMail Issues
- Verify SMTP credentials are correct
- Check SMTP_HOST and SMTP_PORT
- Ensure your SpaceMail account is active
- Check SpaceMail dashboard for errors

### Gmail "Less secure apps" error
- You need an **app password**, not your regular Gmail password
- Enable 2-factor authentication first
- Generate app password at https://myaccount.google.com/apppasswords

### Emails not sending
1. Check `backend/.env` file exists
2. Verify SMTP credentials are correct
3. Run test script: `node test-backend-email-setup.js`
4. Check backend logs for errors

### Emails in spam
- Mark as "Not Spam" to improve deliverability
- For production, verify your domain in SpaceMail
- Add SPF and DKIM records

## 📚 Full Documentation

- `SPACEMAIL_SETUP_GUIDE.md` - SpaceMail-specific setup
- `BACKEND_EMAIL_SETUP_GUIDE.md` - Complete setup guide
- `SQUAD_BUILDER_BACKEND_EMAIL_COMPLETE.md` - Implementation details
- `backend/.env.example` - Configuration template

## 🎯 Production Setup

For production with SpaceMail:

1. Verify your domain in SpaceMail dashboard
2. Add DNS records (SPF, DKIM, DMARC)
3. Use custom domain email: `no-reply@arenapro.com`
4. Monitor deliverability in SpaceMail dashboard
5. Set up bounce handling

## ✅ Checklist

- [ ] Got SpaceMail credentials (or Gmail app password)
- [ ] Created `backend/.env` with SMTP credentials
- [ ] Ran test script successfully
- [ ] Received test email
- [ ] Started backend server
- [ ] Tested Squad Builder email flow

---

**Need Help?** 
- SpaceMail: See `SPACEMAIL_SETUP_GUIDE.md`
- General: See `BACKEND_EMAIL_SETUP_GUIDE.md`
