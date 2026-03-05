# Google Sign-In APK Fix - Step by Step

Your package name: `arenapropk.online`

## The Problem
The error "Custom URI scheme is not enabled for your Android client" means your production SHA-1 certificate fingerprint is not registered in Firebase Console.

## Solution (Follow these exact steps):

### Step 1: Get Your Production SHA-1 Fingerprint

Option A - Using EAS CLI (Recommended):
```bash
eas credentials
```
Then select:
- Platform: Android
- Profile: production  
- Select: "Keystore: Manage everything needed to build your project"
- Select: "View the Keystore"
- Copy the SHA-1 fingerprint (it looks like: `AA:BB:CC:DD:EE:FF:...`)

Option B - From EAS Dashboard:
1. Go to https://expo.dev
2. Navigate to your project
3. Go to "Builds" tab
4. Click on your latest Android build
5. Look for "Credentials" section
6. Copy the SHA-1 fingerprint

### Step 2: Add SHA-1 to Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your "Arena Pro" project
3. Click the gear icon (⚙️) → Project settings
4. Scroll down to "Your apps" section
5. Find your Android app with package name: `arenapropk.online`
6. Scroll to "SHA certificate fingerprints" section
7. Click "Add fingerprint" button
8. Paste your production SHA-1 fingerprint
9. Click "Save"

### Step 3: Verify OAuth Client

1. Still in Firebase Console
2. Go to "Authentication" → "Sign-in method"
3. Click on "Google" provider
4. Make sure it's enabled
5. Check "Web SDK configuration" - copy the Web client ID
6. Go to Google Cloud Console: https://console.cloud.google.com/
7. Select your project
8. Go to "APIs & Services" → "Credentials"
9. You should see an Android OAuth client with your package name
10. Click on it and verify:
    - Package name: `arenapropk.online`
    - SHA-1 fingerprint: (your production SHA-1)

If the Android OAuth client doesn't exist, create it:
- Click "Create Credentials" → "OAuth client ID"
- Application type: Android
- Name: Arena Pro Android
- Package name: `arenapropk.online`
- SHA-1: (paste your production SHA-1)
- Click "Create"

### Step 4: Download Updated google-services.json

1. Back in Firebase Console
2. Project Settings → Your Android app
3. Click "Download google-services.json"
4. Replace the file in your project root: `./google-services.json`

### Step 5: Rebuild Your APK

```bash
eas build --platform android --profile production
```

Wait for the build to complete, then download and install the new APK.

### Step 6: Test

1. Install the new APK on your device
2. Open the app
3. Try Google Sign-In
4. It should work now!

## Troubleshooting

### Still getting the error?

1. **Check package name matches everywhere:**
   - app.json: `arenapropk.online` ✓
   - Firebase Console Android app
   - Google Cloud Console OAuth client

2. **Make sure you have BOTH SHA-1 fingerprints:**
   - Debug SHA-1 (for development/Expo Go)
   - Production SHA-1 (for release APK)
   
   Add both to Firebase Console!

3. **Clear app data:**
   - Uninstall the old APK completely
   - Install the new APK
   - Try again

4. **Check Firebase Authentication is enabled:**
   - Firebase Console → Authentication
   - Sign-in method → Google → Enabled

5. **Verify google-services.json is updated:**
   - Check the file modification date
   - Make sure it's the latest version from Firebase

## Quick Command Reference

```bash
# Get SHA-1 from EAS
eas credentials

# Build production APK
eas build --platform android --profile production

# Build and auto-submit
eas build --platform android --profile production --auto-submit
```

## Important Notes

- Firebase Console changes take effect immediately (no waiting)
- You MUST rebuild the APK after updating google-services.json
- The production SHA-1 is different from your debug SHA-1
- Keep both SHA-1 fingerprints in Firebase Console for development and production

## Success Indicators

✅ No "invalid_request" error
✅ Google Sign-In popup appears
✅ Can select Google account
✅ Successfully signs in and navigates to home screen
