# Fix Platform ReferenceError

## Error
```
ERROR [ReferenceError: Property 'Platform' doesn't exist]
```

## Likely Causes

1. **Metro Bundler Cache Issue** - Old cached code is being used
2. **Import Statement Issue** - Platform not imported in a file that uses it
3. **Scope Issue** - Platform used in a callback where it's not in scope

## Solutions

### Solution 1: Clear Metro Bundler Cache (Most Common Fix)
```bash
# Stop the current Metro bundler (Ctrl+C)

# Clear cache and restart
npx expo start -c

# Or on Windows
npx expo start --clear
```

### Solution 2: Clear All Caches
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rmdir /s /q node_modules
npm install

# Clear Metro cache
npx expo start -c
```

### Solution 3: Verify Platform Imports

All files using `Platform.OS` or `Platform.select` must import Platform:

```javascript
import { Platform } from 'react-native';
```

Files that use Platform in this project:
- ✅ src/screens/turf/TurfDetailScreen.js
- ✅ src/screens/main/MapScreen.js
- ✅ src/screens/main/VenueListScreen.js
- ✅ src/screens/booking/BookingConfirmScreen.js
- ✅ src/components/CustomTabBar.js
- ✅ src/components/GlassCard.js
- ✅ All other screen files

### Solution 4: Check for Dynamic Imports

If you're using dynamic imports or lazy loading, ensure Platform is imported in those files too.

### Solution 5: Restart Development Environment

```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Restart Expo
npx expo start -c
```

## Quick Fix Command

Run this in your terminal:

```bash
npx expo start --clear
```

Then reload the app on your device/emulator:
- **Android**: Press `r` in Metro terminal or shake device → Reload
- **iOS**: Press `Cmd+R` or shake device → Reload

## If Error Persists

1. Check the error stack trace to see which file is causing the issue
2. Look for the exact line number in the error
3. Verify that file has `Platform` imported from 'react-native'
4. Check if Platform is used inside a callback or closure where it might be out of scope

## Prevention

Always import Platform when using it:

```javascript
// ✅ Correct
import { View, Text, Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS specific code
}

// ❌ Wrong - Platform not imported
import { View, Text } from 'react-native';

if (Platform.OS === 'ios') { // ReferenceError!
  // iOS specific code
}
```

---

**Most likely fix**: Clear Metro cache with `npx expo start -c`
