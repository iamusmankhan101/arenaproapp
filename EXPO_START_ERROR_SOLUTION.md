# Expo Start Error Solution - "Body is unusable"

## Problem
When running `npm start` or `npx expo start`, you encounter the error:
```
TypeError: Body is unusable: Body has already been read
```

## Root Cause
This is a known issue with Expo CLI when it tries to fetch native module versions from the Expo API. The error occurs in the Expo CLI itself, not in your application code.

## Important Note ⚠️
**This error does NOT affect your app functionality.** It's just a CLI warning that occurs during the startup process. Your app will still work normally.

## Solutions

### Quick Fix (Recommended)
1. **Use the batch file**: Run `FIX_EXPO_START_ERROR.bat`
2. **Or manually run**: `npx expo start --port 8082`

### Manual Steps
1. **Kill Node processes**:
   ```bash
   taskkill /F /IM node.exe
   ```

2. **Clear caches**:
   ```bash
   npm cache clean --force
   npx expo install --fix
   ```

3. **Start with specific port**:
   ```bash
   npx expo start --port 8082
   ```

### Alternative Methods

#### Method 1: Use Expo Development Build
```bash
npx expo run:android
# or
npx expo run:ios
```

#### Method 2: Use Metro directly
```bash
npx react-native start --port 8082
```

#### Method 3: Downgrade Expo CLI (if needed)
```bash
npm install -g @expo/cli@0.17.8
```

## What's Happening
The error occurs when Expo CLI tries to:
1. Fetch native module versions from Expo's API
2. The HTTP response body gets read multiple times
3. This causes the "Body is unusable" error

## Verification
After starting, you should see:
- ✅ Metro bundler starts successfully
- ✅ QR code appears for Expo Go
- ✅ Your app loads normally on device/simulator
- ⚠️ The error message can be ignored

## Long-term Solution
This is an Expo CLI issue that should be fixed in future versions. For now:
1. **Ignore the error** - it doesn't affect functionality
2. **Use the workarounds** above when starting the project
3. **Update Expo CLI** regularly for potential fixes

## Files Created
- `FIX_EXPO_START_ERROR.bat` - Automated fix script
- This documentation file

## Status
✅ **Workaround Available** - Your app will work normally despite the error message.