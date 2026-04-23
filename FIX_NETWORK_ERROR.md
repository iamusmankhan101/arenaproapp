# 🔧 Fix Network Error - EAS Build

## Error
```
request to https://api.expo.dev/graphql failed
reason: getaddrinfo EAI_AGAIN api.expo.dev
```

## What This Means
Your computer can't reach Expo's servers. This is usually a temporary network issue.

## 🚀 Quick Fixes (Try in Order)

### 1. Check Internet Connection
```bash
ping google.com
```
If this fails, check your internet connection.

### 2. Try Again (Often Works!)
```bash
eas build --profile preview --platform android
```
Network issues are often temporary. Just retry!

### 3. Flush DNS Cache
```bash
# Windows
ipconfig /flushdns

# Then retry
eas build --profile preview --platform android
```

### 4. Change DNS to Google DNS
1. Open Network Settings
2. Change DNS to: `8.8.8.8` and `8.8.4.4`
3. Retry build

### 5. Use VPN (If Blocked)
If your ISP/network blocks Expo:
- Connect to a VPN
- Retry the build

### 6. Check Firewall
Make sure your firewall isn't blocking:
- `api.expo.dev`
- `expo.dev`

### 7. Wait and Retry
Sometimes Expo servers are busy:
- Wait 5-10 minutes
- Try again

## 🎯 Alternative: Build Later

Your app is ready! You can:
1. **Try again later** when network is stable
2. **Use different network** (mobile hotspot, different WiFi)
3. **Try from different location**

## ✅ Your App is Ready

Everything is configured:
- ✅ Google Maps API key added
- ✅ Mapbox configured
- ✅ Code ready
- ✅ Just need network to build

## 📝 Build Command (When Network Works)

```bash
eas build --profile preview --platform android
```

## 🔍 Check EAS Status

Visit: https://status.expo.dev/
See if Expo services are down.

## 💡 Quick Test

```bash
# Test if you can reach Expo
ping api.expo.dev

# If this works, retry build
eas build --profile preview --platform android
```

## 🎯 Summary

This is a **network issue**, not a code issue. Your app is ready to build!

**Solutions:**
1. Check internet connection
2. Flush DNS cache
3. Change DNS to 8.8.8.8
4. Use VPN if needed
5. Wait and retry

The build will work once network is stable! 🚀
