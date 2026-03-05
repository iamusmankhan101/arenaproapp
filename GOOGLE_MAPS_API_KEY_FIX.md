# 🎯 APK Crash Fixed - Google Maps API Key Missing

## ✅ Crash Identified!

Your app crashes with:
```
FATAL EXCEPTION: main
java.lang.IllegalStateException: API key not found.  
Check that <meta-data android:name="com.google.android.geo.API_KEY" android:value="your API key"/> 
is in the <application> element of AndroidManifest.xml
```

**Cause**: Google Maps API key is not configured in `app.json` for the APK build.

**When it crashes**: When navigating to MapScreen (the map with venue locations).

## 🔧 Fix (2 Steps)

### Step 1: Get Your Google Maps API Key

You already have a Google Maps API key (you're using it in development). Find it in one of these places:

1. **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. **Your Firebase project** (if Maps is enabled there)
3. **Your `.env` file** (if you have one)

Your API key looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Step 2: Add API Key to app.json

Open `app.json` and add the Google Maps API key to the `android` section:

```json
{
  "expo": {
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#004d43"
      },
      "package": "arenapropk.online",
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.RECORD_AUDIO"
      ],
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
        }
      },
      "runtimeVersion": "1.0.0",
      ...
    }
  }
}
```

**Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key!**

## 📝 Complete Example

Here's what your `android` section should look like:

```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#004d43"
  },
  "package": "arenapropk.online",
  "googleServicesFile": "./google-services.json",
  "permissions": [
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.RECORD_AUDIO"
  ],
  "config": {
    "googleMaps": {
      "apiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    }
  },
  "runtimeVersion": "1.0.0",
  "statusBar": {
    "barStyle": "dark-content",
    "backgroundColor": "#FFFFFF",
    "translucent": true
  },
  "navigationBar": {
    "backgroundColor": "#FFFFFF",
    "barStyle": "dark-content"
  },
  "intentFilters": [
    {
      "action": "VIEW",
      "autoVerify": true,
      "data": [
        {
          "scheme": "https",
          "host": "arenapro.pk",
          "pathPrefix": "/reset-password"
        }
      ],
      "category": [
        "BROWSABLE",
        "DEFAULT"
      ]
    }
  ]
}
```

## 🚀 Rebuild Your APK

After adding the API key:

```bash
eas build --profile preview --platform android
```

Or if building locally:
```bash
npx expo prebuild --clean
npx expo run:android
```

## ✅ What This Fixes

- ✅ App will no longer crash when opening MapScreen
- ✅ Google Maps will display properly in the APK
- ✅ Venue locations will show on the map
- ✅ User location will work correctly

## 🔍 How to Find Your API Key

### Option 1: Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your project
3. Look for "API Keys" section
4. Find the key (usually named "Android key" or "Maps SDK for Android")
5. Copy the key

### Option 2: Check Your Code
Search your project for existing API key usage:
```bash
# Search in your project
grep -r "AIza" .
```

### Option 3: Create New API Key
If you don't have one:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" > "API Key"
3. Restrict the key:
   - Click "Edit API key"
   - Under "Application restrictions", select "Android apps"
   - Add your package name: `arenapropk.online`
   - Add your SHA-1 fingerprint (get it with: `keytool -list -v -keystore ~/.android/debug.keystore`)
4. Under "API restrictions", select "Restrict key"
5. Enable: "Maps SDK for Android"
6. Save and copy the key

## 🎯 After the Fix

Your app will work perfectly! The crash was happening because:
1. MapScreen tries to load Google Maps
2. Google Maps requires an API key in production (APK)
3. The key was missing from AndroidManifest.xml
4. App crashed immediately

Once you add the API key and rebuild, the app will work smoothly!

## 💡 Pro Tip

For security, you can also use environment variables:

1. Create `.env` file:
```
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

2. In `app.json`:
```json
"config": {
  "googleMaps": {
    "apiKey": process.env.GOOGLE_MAPS_API_KEY
  }
}
```

But for now, just add it directly to `app.json` to fix the crash quickly!

---

**That's it!** Add your Google Maps API key to `app.json` and rebuild. The crash will be fixed! 🎉
