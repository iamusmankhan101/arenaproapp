# APK Crash Debugging Guide

## Common APK-Specific Crash Causes

APK crashes that don't happen in Expo Go are usually caused by:

1. **Production mode optimizations** - Code minification issues
2. **Missing native modules** - Modules that work in Expo Go but not in standalone
3. **Hermes engine differences** - JavaScript engine differences
4. **ProGuard/R8 issues** - Android code obfuscation problems
5. **Missing permissions** - Permissions not declared in app.json

## Step 1: Enable Crash Logging

### A. Install Sentry (Recommended)

```bash
npx expo install @sentry/react-native
```

Add to `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "@sentry/react-native/expo",
        {
          "organization": "your-org",
          "project": "your-project"
        }
      ]
    ]
  }
}
```

### B. Use LogCat (Android)

Connect device via USB and run:
```bash
adb logcat | grep -i "ReactNativeJS\|AndroidRuntime"
```

Or filter for your app:
```bash
adb logcat | grep "com.iamusmankhan.arenapro"
```

## Step 2: Common Fixes

### Fix 1: Disable Hermes (If causing issues)

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

### Fix 2: Add Error Boundaries

Create `src/components/ErrorBoundary.js`:
```javascript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to crash reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error?.toString()}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#004d43',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ErrorBoundary;
```

Wrap your app in `App.js`:
```javascript
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      {/* Your app content */}
    </ErrorBoundary>
  );
}
```

### Fix 3: Check Required Permissions

In `app.json`, ensure all permissions are declared:
```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### Fix 4: Production-Safe Console Logs

Create `src/utils/logger.js`:
```javascript
const isDevelopment = __DEV__;

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args) => {
    console.error(...args); // Always log errors
  },
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
};
```

Replace all `console.log` with `logger.log`.

### Fix 5: Async Storage Issues

If using AsyncStorage, ensure it's properly installed:
```bash
npx expo install @react-native-async-storage/async-storage
```

### Fix 6: Font Loading Issues

Ensure fonts are loaded before rendering:
```javascript
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Montserrat_400Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
    // ... other fonts
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <YourApp />;
}
```

## Step 3: Build Debug APK

Build a debug APK to get better error messages:

```bash
eas build --profile preview --platform android
```

Or local build:
```bash
npx expo run:android --variant debug
```

## Step 4: Specific Crash Scenarios

### Crash on Startup

**Likely causes:**
- Firebase initialization error
- Font loading error
- Redux store configuration error

**Fix:**
Add try-catch in App.js:
```javascript
try {
  // Your app initialization
} catch (error) {
  console.error('App initialization error:', error);
  Alert.alert('Startup Error', error.message);
}
```

### Crash on Navigation

**Likely causes:**
- Missing navigation params
- Undefined route names
- Memory leaks

**Fix:**
Add navigation error handling:
```javascript
// In AppNavigator.js
import { NavigationContainer } from '@react-navigation/native';

<NavigationContainer
  onError={(error) => {
    console.error('Navigation error:', error);
  }}
>
  {/* Your navigators */}
</NavigationContainer>
```

### Crash on Image Load

**Likely causes:**
- Invalid image URIs
- Network errors
- Memory issues

**Fix:**
Add error handling to images:
```javascript
<Image
  source={{ uri: imageUrl }}
  onError={(error) => {
    console.error('Image load error:', error);
  }}
  defaultSource={require('./images/placeholder.jpg')}
/>
```

### Crash on API Call

**Likely causes:**
- Network timeout
- Invalid response format
- CORS issues

**Fix:**
Add global error handling:
```javascript
// In src/services/api.js
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (!error.response) {
      // Network error
      Alert.alert('Network Error', 'Please check your internet connection');
    }
    return Promise.reject(error);
  }
);
```

## Step 5: ProGuard Rules (If using)

Create `android/app/proguard-rules.pro`:
```
# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Your app
-keep class com.iamusmankhan.arenapro.** { *; }
```

## Step 6: Memory Optimization

### Reduce Image Sizes
```javascript
// Use smaller images in production
const imageUrl = __DEV__ 
  ? originalUrl 
  : originalUrl.replace('/upload/', '/upload/w_800,q_auto/');
```

### Limit List Rendering
```javascript
<FlatList
  data={items}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  initialNumToRender={10}
/>
```

## Step 7: Test Build Configuration

Create `eas.json` with proper settings:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## Step 8: Crash Report Analysis

### Read LogCat Output

Look for these patterns:
```
FATAL EXCEPTION: main
java.lang.RuntimeException: Unable to start activity
```

```
ReactNativeJS: Error: 
```

```
AndroidRuntime: FATAL EXCEPTION
```

### Common Error Messages

1. **"Unable to resolve module"**
   - Missing dependency
   - Fix: `npm install <module>`

2. **"Network request failed"**
   - API endpoint unreachable
   - Fix: Check API URL in production

3. **"Invariant Violation"**
   - React rendering error
   - Fix: Check for unwrapped values in Text components

4. **"Maximum call stack size exceeded"**
   - Infinite loop or recursion
   - Fix: Check useEffect dependencies

## Quick Checklist

Before building APK:

- [ ] All Text components have String() wrapped values
- [ ] All images have error handlers
- [ ] All API calls have error handling
- [ ] All navigation params are validated
- [ ] Fonts are properly loaded
- [ ] Permissions are declared in app.json
- [ ] Firebase is properly configured
- [ ] AsyncStorage is installed
- [ ] Error boundaries are in place
- [ ] Console logs are production-safe

## Next Steps

1. **Build debug APK** to get detailed logs
2. **Connect device via USB** and run LogCat
3. **Reproduce the crash** while monitoring logs
4. **Identify the error** from LogCat output
5. **Apply appropriate fix** from this guide
6. **Test again** until stable

## Need Help?

If crashes continue:
1. Share the LogCat output
2. Describe when the crash occurs (startup, navigation, specific action)
3. Mention if it works in Expo Go but not APK
4. Share any error messages from the build process
