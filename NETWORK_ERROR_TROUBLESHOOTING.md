# Firebase Network Error Troubleshooting Guide

## 🔍 Quick Diagnosis

If you're experiencing network errors with Firebase authentication, follow these steps:

### 1. Run Network Diagnostic
```bash
node debug-firebase-network-error.js
```

### 2. Common Network Error Causes

#### A. Internet Connection Issues
- **Symptoms**: "Network request failed", "Connection timeout"
- **Solutions**:
  - Check your internet connection
  - Try switching between WiFi and mobile data
  - Disable VPN if using one
  - Restart your router/modem

#### B. Firewall/Antivirus Blocking
- **Symptoms**: Requests hang or timeout
- **Solutions**:
  - Temporarily disable firewall/antivirus
  - Add Firebase domains to whitelist:
    - `*.firebaseapp.com`
    - `*.googleapis.com`
    - `*.google.com`

#### C. Corporate Network Restrictions
- **Symptoms**: Works on mobile data but not office WiFi
- **Solutions**:
  - Contact IT to whitelist Firebase domains
  - Use mobile hotspot for testing
  - Configure proxy settings if needed

#### D. DNS Issues
- **Symptoms**: "DNS resolution failed"
- **Solutions**:
  - Change DNS to Google DNS (8.8.8.8, 8.8.4.4)
  - Flush DNS cache: `ipconfig /flushdns` (Windows)
  - Try different DNS servers (Cloudflare: 1.1.1.1)

### 3. React Native Specific Issues

#### A. Metro Bundler Network Issues
- **Solution**: Restart Metro bundler
```bash
npx react-native start --reset-cache
```

#### B. Android Network Security Config
- **Symptoms**: Works on iOS but not Android
- **Solution**: Check `android/app/src/main/res/xml/network_security_config.xml`

#### C. iOS App Transport Security
- **Symptoms**: Works on Android but not iOS
- **Solution**: Check `ios/YourApp/Info.plist` for ATS settings

### 4. Firebase Configuration Issues

#### A. Invalid API Key
- **Symptoms**: "Invalid API key" error
- **Solutions**:
  - Verify API key in Firebase Console
  - Regenerate API key if needed
  - Check if project is active

#### B. Authentication Not Enabled
- **Symptoms**: "Operation not allowed" error
- **Solutions**:
  - Enable Authentication in Firebase Console
  - Enable Email/Password provider
  - Enable Google Sign-In if using

#### C. Incorrect Project Configuration
- **Symptoms**: "Project not found" error
- **Solutions**:
  - Verify project ID in `firebase.js`
  - Check `google-services.json` (Android)
  - Check `GoogleService-Info.plist` (iOS)

### 5. Development Environment Fixes

#### A. Clear React Native Cache
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear npm cache
npm cache clean --force

# Clear Expo cache (if using Expo)
expo r -c
```

#### B. Reset AsyncStorage
```javascript
// Add this to your app temporarily
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.clear();
```

#### C. Restart Development Server
```bash
# Kill all Node processes
taskkill /f /im node.exe

# Restart Metro
npx react-native start
```

### 6. Network Error Recovery Features

The updated Firebase configuration now includes:

#### A. Automatic Retry Logic
- Retries failed requests up to 3 times
- Exponential backoff between retries
- Smart error detection (doesn't retry auth errors)

#### B. Network Connectivity Checks
- Tests internet connection before Firebase operations
- Provides user-friendly error messages
- Graceful fallback for development

#### C. Timeout Handling
- 10-second timeout for Firebase operations
- Prevents hanging requests
- Clear error messages for timeouts

### 7. Testing Network Fixes

#### A. Test Basic Connectivity
```bash
ping google.com
ping firebaseapp.com
```

#### B. Test Firebase Endpoints
```bash
curl -I https://arena-pro-97b5f.firebaseapp.com
```

#### C. Test Authentication Flow
1. Try signing in with test credentials
2. Check browser network tab for failed requests
3. Look for specific error codes in console

### 8. Emergency Fallback Options

#### A. Development Bypass
If Firebase is completely inaccessible, you can temporarily enable development bypass:

```javascript
// In src/config/devConfig.js
BYPASS_AUTH: __DEV__ && true, // Enable for testing
```

#### B. Mock API Mode
```javascript
// In src/config/devConfig.js
USE_MOCK_API: true, // Use local mock data
```

### 9. Production Deployment Considerations

#### A. Environment Variables
- Use different Firebase configs for dev/staging/prod
- Store sensitive keys in environment variables
- Never commit API keys to version control

#### B. Network Optimization
- Implement proper loading states
- Add offline support
- Cache user data locally

### 10. Getting Help

If network errors persist:

1. **Check Firebase Status**: https://status.firebase.google.com/
2. **Firebase Support**: https://firebase.google.com/support/
3. **Stack Overflow**: Tag questions with `firebase` and `react-native`
4. **GitHub Issues**: Check Firebase SDK issues

### 11. Monitoring and Logging

Enable detailed logging to diagnose issues:

```javascript
// In your app
console.log('Network status:', await checkNetworkConnection());
console.log('Firebase connection:', await testFirebaseConnection());
```

## 🚀 Quick Fix Commands

```bash
# Complete reset and restart
npm cache clean --force
npx react-native start --reset-cache
node debug-firebase-network-error.js

# If still having issues
node fix-firebase-network-error.js
```

## ✅ Success Indicators

You'll know the network error is fixed when:
- ✅ `debug-firebase-network-error.js` shows all green checkmarks
- ✅ Authentication flows work without timeouts
- ✅ No "network request failed" errors in console
- ✅ Firebase operations complete within 10 seconds