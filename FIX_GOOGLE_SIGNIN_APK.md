# Fix Google Sign-In in APK/AAB

The error "Custom URI scheme is not enabled for your Android client" means your production SHA-1 certificate isn't registered in Firebase.

## Step 1: Get Your Production SHA-1 Fingerprint

Run this command to get your production certificate fingerprint:

```bash
eas credentials
```

Then select:
1. Android
2. production
3. Keystore: Manage everything needed to build your project
4. View the Keystore
5. Copy the SHA-1 fingerprint

Alternatively, if you've already built an APK, you can extract it from the APK:

```bash
keytool -printcert -jarfile your-app.apk
```

## Step 2: Add SHA-1 to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps"
5. Click on your Android app
6. Scroll to "SHA certificate fingerprints"
7. Click "Add fingerprint"
8. Paste your production SHA-1 fingerprint
9. Click Save

## Step 3: Download Updated google-services.json

1. In Firebase Console, still in your Android app settings
2. Click "Download google-services.json"
3. Replace the file in your project at: `android/app/google-services.json`
4. Commit the changes

## Step 4: Rebuild Your APK

```bash
eas build --platform android --profile production
```

## Alternative: Get SHA-1 from EAS Build

If you don't have access to `eas credentials`, you can get the SHA-1 from your build:

1. Go to https://expo.dev/accounts/[your-account]/projects/[your-project]/builds
2. Click on your latest Android build
3. Look for "Credentials" section
4. Copy the SHA-1 fingerprint

## Common Issues:

### Issue 1: Multiple SHA-1 Fingerprints
You might need BOTH:
- Debug SHA-1 (for development)
- Production SHA-1 (for release APK)

Add both to Firebase Console.

### Issue 2: Package Name Mismatch
Verify your package name in:
- `app.json` → `android.package`
- Firebase Console → Android app package name

They must match exactly!

### Issue 3: OAuth Client Not Created
Firebase should auto-create the OAuth client, but if not:
1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Create OAuth 2.0 Client ID for Android
4. Add your SHA-1 and package name

## Quick Fix Script

Create a file `get-sha1.sh`:

```bash
#!/bin/bash
echo "Getting SHA-1 from EAS..."
eas credentials -p android
```

Run it:
```bash
chmod +x get-sha1.sh
./get-sha1.sh
```

## Verification

After adding SHA-1 and rebuilding:
1. Install the new APK
2. Try Google Sign-In
3. It should work without the "invalid_request" error

## Notes:
- Changes in Firebase Console take effect immediately
- You don't need to wait for propagation
- Make sure to download the updated google-services.json
- Rebuild your APK after updating the file
