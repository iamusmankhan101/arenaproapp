# Fix expo-blur Module Resolution Error

## Issue
The app cannot find the `expo-blur` module even though it's installed in package.json.

## Solution

### Step 1: Stop the Development Server
Press `Ctrl+C` in your terminal where Expo is running to stop the server.

### Step 2: Clear Metro Bundler Cache
Run this command:
```bash
npx expo start -c
```

The `-c` flag clears the Metro bundler cache.

### Alternative: Clear All Caches
If the above doesn't work, run:
```bash
npm start -- --reset-cache
```

Or:
```bash
npx react-native start --reset-cache
```

### Step 3: Verify Installation
Check that expo-blur is in node_modules:
```bash
dir node_modules\expo-blur
```

If it's not there, reinstall:
```bash
npm install
```

### Step 4: Restart Development Server
```bash
npx expo start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for Web

## Why This Happens
- Metro bundler caches module resolutions
- When new packages are installed, the cache may not update
- Clearing the cache forces Metro to re-scan node_modules

## Quick Fix Command
```bash
npx expo start -c
```

This single command will:
1. Clear the cache
2. Start the development server
3. Allow you to run on your device

## If Still Not Working

### Check node_modules
```bash
dir node_modules\expo-blur
```

### Reinstall Dependencies
```bash
rmdir /s /q node_modules
npm install
npx expo start -c
```

### Check Package Version
The package.json shows: `"expo-blur": "~15.0.8"`
This is compatible with Expo SDK 54.

## Success Indicator
When it works, you should see:
- No "Unable to resolve module expo-blur" error
- App loads successfully
- Glassmorphism effects visible on venue cards
