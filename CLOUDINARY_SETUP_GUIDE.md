# Cloudinary Setup Guide for Payment Screenshots

## Overview
This app uses Cloudinary to store payment proof screenshots uploaded by users during the booking process. Cloudinary provides free image hosting with a generous free tier.

## Why Cloudinary?
- **Free Tier**: 25 GB storage, 25 GB bandwidth per month
- **Fast CDN**: Global content delivery network
- **Easy Integration**: Simple REST API
- **No Backend Required**: Unsigned uploads work directly from mobile app
- **Image Optimization**: Automatic format conversion and compression

## Setup Steps

### 1. Create Cloudinary Account
1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email address
4. Log in to your dashboard

### 2. Get Your Cloud Name
1. On the dashboard, you'll see your **Cloud name** at the top
2. Copy this value (e.g., `dxyz123abc`)
3. You'll need this for configuration

### 3. Create an Upload Preset
An upload preset allows unsigned uploads from your mobile app without exposing API secrets.

1. Go to **Settings** (gear icon) → **Upload**
2. Scroll down to **Upload presets** section
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: Choose a name (e.g., `payment_proofs_unsigned`)
   - **Signing Mode**: Select **Unsigned** ⚠️ Important!
   - **Folder**: Enter `payment_proofs` (optional but recommended)
   - **Access mode**: Leave as **Public**
   - **Unique filename**: Enable (recommended)
   - **Overwrite**: Disable (recommended)
5. Click **Save**
6. Copy the **preset name** you created

### 4. Configure the App

Open `src/config/cloudinary.config.js` and update:

\`\`\`javascript
export const CLOUDINARY_CONFIG = {
  // Replace with your cloud name from step 2
  CLOUD_NAME: 'dxyz123abc',
  
  // Replace with your upload preset name from step 3
  UPLOAD_PRESET: 'payment_proofs_unsigned',
  
  // ... rest of config
};
\`\`\`

### 5. Test the Upload

1. Run your app
2. Navigate to booking confirmation
3. Select "Pay Advance & Save 10%"
4. Upload a payment screenshot
5. Check your Cloudinary dashboard → Media Library → payment_proofs folder

## Security Considerations

### Unsigned Uploads
- ✅ **Safe for mobile apps**: No API secrets exposed in app code
- ✅ **Limited scope**: Upload preset controls what can be uploaded
- ✅ **Folder isolation**: Files go to specific folder only

### Recommended Settings
1. **Enable Upload Preset Restrictions**:
   - Go to Settings → Security
   - Enable "Restrict upload sources"
   - Add your app's domain/bundle ID

2. **Set Upload Limits**:
   - Max file size: 10 MB (sufficient for screenshots)
   - Allowed formats: jpg, png, webp
   - Max dimensions: 1920x1080

3. **Enable Moderation** (Optional):
   - Go to Settings → Upload
   - Enable "Moderation" for manual approval
   - Or use Cloudinary's AI moderation

## Folder Structure

```
cloudinary-root/
└── payment_proofs/
    ├── 1234567890_screenshot1.jpg
    ├── 1234567891_screenshot2.png
    └── ...
```

## Viewing Uploaded Images

### In Cloudinary Dashboard
1. Go to **Media Library**
2. Navigate to **payment_proofs** folder
3. Click any image to view details
4. Copy URL to share with venue owners

### In Admin Panel
- Payment screenshots are stored in booking documents
- URL format: `https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/payment_proofs/{filename}`
- Admin can view screenshots directly from booking details

## Cost Estimation

### Free Tier Limits
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month

### Typical Usage
- Average screenshot: ~500 KB
- 1000 bookings/month = ~500 MB storage
- Well within free tier limits

### If You Exceed Free Tier
- Upgrade to paid plan starting at $89/month
- Or implement automatic deletion of old screenshots (>90 days)

## Troubleshooting

### Upload Fails with "Invalid upload preset"
- ✅ Check that preset name matches exactly
- ✅ Ensure preset is set to "Unsigned"
- ✅ Verify cloud name is correct

### Upload Fails with "Upload not allowed"
- ✅ Check upload preset restrictions
- ✅ Verify file size is under limit
- ✅ Check file format is allowed

### Images Not Showing
- ✅ Check URL format is correct
- ✅ Verify image is public (not private)
- ✅ Check Cloudinary dashboard for the file

### Slow Uploads
- ✅ Compress images before upload (already handled in code)
- ✅ Check user's internet connection
- ✅ Consider using Cloudinary's auto-format feature

## Alternative: Local Storage Only

If you don't want to use Cloudinary, you can store screenshots locally:

1. Comment out the Cloudinary upload in `BookingConfirmScreen.js`
2. Store the local URI in the booking document
3. Users can share screenshots via WhatsApp directly

This approach:
- ✅ No external service needed
- ✅ Faster (no upload time)
- ❌ Screenshots not accessible to admin panel
- ❌ Users must manually share with venue

## Support

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **React Native Guide**: https://cloudinary.com/documentation/react_native_integration
- **Support**: https://support.cloudinary.com

---

**Status**: Ready to configure
**Last Updated**: February 22, 2026
