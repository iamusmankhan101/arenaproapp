# APK Crash Debugging - Quick Start Guide

## Current Status
Your app crashes in the APK build but works fine in Expo Go. We've already fixed all text rendering errors, so the crashes are likely APK-specific issues.

## Step 1: Install ADB (Android Debug Bridge)

### Option A: Install Android Studio (Recommended)
1. Download Android Studio from: https://developer.android.com/studio
2. Install it (this includes ADB)
3. ADB will be located at: `C:\Users\[YourUsername]\AppData\Local\Android\Sdk\platform-tools\adb.exe`
4. Add to PATH or use full path

### Option B: Install ADB Only (Faster)
1. Download Platform Tools from: https://developer.android.com/studio/releases/platform-tools
2. Extract the ZIP file to a folder (e.g., `C:\adb`)
3. Add the folder to your system PATH

### Verify Installation
Open a new terminal and run:
```bash
adb version
```

You should see something like:
```
Android Debug Bridge version 1.0.41
```

## Step 2: Connect Your Device

1. **Enable Developer Options** on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - You'll see "You are now a developer!"

2. **Enable USB Debugging**:
   - Go to Settings > Developer Options
   - Enable "USB Debugging"

3. **Connect via USB**:
   - Connect your phone to computer with USB cable
   - On your phone, allow USB debugging when prompted
   - Select "Always allow from this computer"

4. **Verify Connection**:
   ```bash
   adb devices
   ```
   
   You should see your device listed:
   ```
   List of devices attached
   ABC123XYZ    device
   ```

## Step 3: Monitor Crash Logs

### Method 1: Use Our Script (After ADB is installed)
```bash
.\DEBUG_APK_CRASH.bat
```

### Method 2: Manual Command (Recommended)
Open terminal and run:
```bash
adb logcat -v time | findstr /i "ReactNativeJS AndroidRuntime FATAL ERROR Exception"
```

### Method 3: Full Logs (If above doesn't show anything)
```bash
adb logcat -v time > crash_log.txt
```
Then open `crash_log.txt` and search for errors.

## Step 4: Reproduce the Crash

1. **Clear old logs**:
   ```bash
   adb logcat -c
   ```

2. **Start monitoring** (use Method 2 above)

3. **Open your APK** on the phone

4. **Navigate to the screen that crashes**

5. **Watch the terminal** - you'll see the crash log appear

## Step 5: Common Crash Patterns & Fixes

### Pattern 1: "Unable to resolve module"
**Error**: `Error: Unable to resolve module X from Y`

**Fix**: Missing dependency
```bash
npm install <missing-module>
npx expo prebuild --clean
```

### Pattern 2: "Invariant Violation: Text strings must be rendered within a <Text> component"
**Status**: ✅ Already fixed in your app

### Pattern 3: "Network request failed"
**Error**: API calls failing

**Fix**: Check if your backend URL is correct in production
- Open `src/config/apiConfig.js`
- Verify the production API URL

### Pattern 4: "Firebase initialization error"
**Error**: Firebase not configured properly

**Fix**: Ensure `google-services.json` is in the correct location:
```bash
# Should be at: android/app/google-services.json
```

### Pattern 5: "Font loading error"
**Error**: Custom fonts not loading

**Fix**: Already handled in your app with font loading checks

### Pattern 6: "Hermes bytecode error"
**Error**: JavaScript engine issues

**Fix**: Disable Hermes in `app.json`:
```json
{
  "expo": {
    "android": {
      "jsEngine": "jsc"
    }
  }
}
```

Then rebuild:
```bash
eas build --profile preview --platform android
```

## Step 6: Share the Crash Log

Once you see the crash in the terminal:

1. **Copy the error lines** (especially lines with "FATAL" or "Exception")
2. **Share them** so we can identify the exact issue
3. **Include**:
   - What screen you were on
   - What action caused the crash
   - The full error message

## Quick Troubleshooting

### If ADB doesn't detect your device:
1. Try a different USB cable (some cables are charge-only)
2. Try a different USB port
3. Restart ADB: `adb kill-server` then `adb start-server`
4. Check USB connection mode on phone (should be "File Transfer" or "MTP")

### If crashes happen immediately on app open:
This is likely a startup error (Firebase, fonts, or Redux). The crash log will show exactly what's failing.

### If crashes happen on specific screens:
This is likely a screen-specific issue (missing data, API calls, or navigation). Navigate to that screen while monitoring logs.

## Alternative: Build Debug APK

If you can't get ADB working, build a debug APK that shows error messages:

```bash
# In app.json, ensure:
{
  "expo": {
    "android": {
      "buildType": "apk"
    }
  }
}

# Build debug version
eas build --profile preview --platform android
```

Debug builds show more detailed error messages on screen.

## Next Steps

1. ✅ Install ADB
2. ✅ Connect your device
3. ✅ Run crash monitoring
4. ✅ Reproduce the crash
5. ✅ Share the crash log

Once we see the actual crash log, we can fix the specific issue immediately!

---

**Need Help?** Share:
- Screenshot of `adb devices` output
- Screenshot of the crash (if visible on screen)
- Copy of the crash log from terminal
