# Ready to Debug APK Crashes

## ✅ What We've Done

### 1. Fixed All Text Rendering Errors
All "Text strings must be rendered within a <Text> component" errors have been fixed in:
- ✅ `src/components/BookingCard.js` - All ternary operators wrapped with String()
- ✅ `src/screens/main/HomeScreen.js` - All dynamic values wrapped
- ✅ `src/screens/booking/BookingConfirmScreen.js` - All template literals and values wrapped

### 2. Error Boundary in Place
- ✅ Global ErrorBoundary component exists at `src/components/ErrorBoundary.js`
- ✅ Already wrapped around the entire app in `App.js`
- ✅ Shows user-friendly error screen with restart option
- ✅ Logs errors to console for debugging

### 3. Created Debugging Tools
- ✅ `APK_CRASH_DEBUG_GUIDE.md` - Comprehensive debugging guide
- ✅ `APK_CRASH_QUICK_START.md` - Quick start instructions
- ✅ `CHECK_ADB_AND_DEBUG.bat` - Automated ADB setup checker
- ✅ `DEBUG_APK_CRASH.bat` - Original crash monitor script

## 🎯 Next Steps to Find the Crash

### Step 1: Install ADB (If Not Already Installed)

**Quick Check:**
```bash
adb version
```

If you see "command not found" or similar, install ADB:

**Option A: Android Studio (Recommended)**
- Download: https://developer.android.com/studio
- Includes ADB and all Android tools

**Option B: Platform Tools Only (Faster)**
- Download: https://developer.android.com/studio/releases/platform-tools
- Extract and add to PATH

### Step 2: Connect Your Device

1. Enable Developer Options (Settings > About Phone > Tap Build Number 7 times)
2. Enable USB Debugging (Settings > Developer Options)
3. Connect phone via USB
4. Allow USB debugging when prompted

**Verify:**
```bash
adb devices
```

Should show your device listed.

### Step 3: Monitor Crash Logs

**Run our automated script:**
```bash
.\CHECK_ADB_AND_DEBUG.bat
```

This will:
- ✅ Check if ADB is installed
- ✅ Show connected devices
- ✅ Start monitoring for crashes
- ✅ Filter only relevant error messages

**Or run manually:**
```bash
adb logcat -v time | findstr /i "ReactNativeJS AndroidRuntime FATAL ERROR Exception"
```

### Step 4: Reproduce the Crash

1. Clear old logs: `adb logcat -c`
2. Start monitoring (Step 3)
3. Open your APK on the phone
4. Navigate to the screen that crashes
5. Watch the terminal for error messages

## 🔍 What to Look For

The crash log will show one of these patterns:

### Pattern 1: Module Resolution Error
```
Error: Unable to resolve module @react-native-firebase/messaging
```
**Cause:** Missing native module in standalone build
**Fix:** Module needs to be properly configured in app.json

### Pattern 2: Firebase Error
```
FirebaseError: Firebase not initialized
```
**Cause:** google-services.json missing or misconfigured
**Fix:** Ensure file is in android/app/ directory

### Pattern 3: Network Error
```
Network request failed
```
**Cause:** API endpoint unreachable or CORS issue
**Fix:** Check production API URL in apiConfig.js

### Pattern 4: Hermes Bytecode Error
```
Hermes bytecode version mismatch
```
**Cause:** JavaScript engine compatibility issue
**Fix:** Disable Hermes or rebuild with correct version

### Pattern 5: Font Loading Error
```
Font 'Montserrat_400Regular' could not be loaded
```
**Cause:** Fonts not embedded in APK
**Fix:** Already handled in your app, but check if fonts are in assets/

### Pattern 6: Navigation Error
```
The action 'NAVIGATE' with payload {"name":"..."} was not handled
```
**Cause:** Invalid navigation route or missing screen
**Fix:** Check navigation configuration

## 📊 Current App Status

### ✅ Working Features
- Error Boundary (catches and displays errors)
- Font loading with fallbacks
- Text rendering (all values wrapped with String())
- Firebase configuration
- Redux store setup
- Navigation structure

### ⚠️ Potential Issues (Need Crash Log to Confirm)
- Native modules (Firebase Messaging, etc.)
- Production API endpoints
- Hermes engine compatibility
- ProGuard/R8 obfuscation
- Memory issues on specific screens

## 🚀 Quick Fixes to Try (Before Getting Crash Log)

### Fix 1: Disable Hermes (If Causing Issues)
In `app.json`:
```json
{
  "expo": {
    "android": {
      "jsEngine": "jsc"
    }
  }
}
```

### Fix 2: Build Debug APK (Shows More Errors)
```bash
eas build --profile preview --platform android
```

### Fix 3: Check Production API URL
Open `src/config/apiConfig.js` and verify the production URL is correct.

### Fix 4: Verify Firebase Config
Ensure `google-services.json` exists at:
```
android/app/google-services.json
```

## 📝 What to Share

Once you get the crash log, share:

1. **The error message** (lines with "FATAL" or "Exception")
2. **When it crashes** (on startup, specific screen, specific action)
3. **Screenshot** of the crash (if visible on screen)
4. **Full crash log** (copy from terminal)

Example crash log format:
```
01-15 10:30:45.123  1234  5678 E ReactNativeJS: Error: Something went wrong
01-15 10:30:45.124  1234  5678 E AndroidRuntime: FATAL EXCEPTION: main
```

## 🎯 Most Likely Causes (Based on Your App)

1. **Firebase Messaging Module** - Used for notifications, might not be configured for standalone
2. **Cloudinary Upload** - Already has error handling, but might fail silently
3. **Email Service** - Backend email calls might timeout
4. **Location Services** - Permissions might not be granted
5. **Image Loading** - Large images might cause memory issues

## ✨ Good News

- Your app has excellent error handling already in place
- Text rendering errors are all fixed
- Error boundary will catch most crashes
- Once we see the crash log, we can fix it immediately

## 🔧 Alternative: Remote Debugging

If you can't get ADB working, try:

1. **Build with Sentry** (crash reporting service)
2. **Use Expo Dev Client** (shows errors on device)
3. **Enable Debug Mode** in APK (shows errors on screen)

---

**Ready to debug!** Run `.\CHECK_ADB_AND_DEBUG.bat` and share the crash log.
