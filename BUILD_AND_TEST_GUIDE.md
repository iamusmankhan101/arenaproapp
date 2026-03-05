# Build and Test Guide - Expo Go vs APK

## Quick Reference

### Test in Expo Go
```bash
npx expo start
```
Then scan QR code with Expo Go app on your device.

### Build APK
```bash
# Preview build (for testing)
eas build --platform android --profile preview

# Production build (for release)
eas build --platform android --profile production
```

## Detailed Steps

### 1. Test Current Version in Expo Go

```bash
# Start Metro bundler
npx expo start

# Or start with cache clear
npx expo start --clear
```

**What to test:**
- [ ] All screens load correctly
- [ ] Fonts display properly
- [ ] Images show up
- [ ] Colors match brand (Primary: #004d43, Secondary: #e8ee26)
- [ ] Navigation works
- [ ] Forms and inputs work
- [ ] Location features work
- [ ] Booking flow works

**Take screenshots of:**
- Sign In screen
- Home screen
- Map screen
- Venue detail screen
- Booking screen
- Profile screen

### 2. Build APK with EAS

#### First Time Setup (if not done):
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project
eas build:configure
```

#### Build Commands:

**Preview Build** (for testing):
```bash
eas build --platform android --profile preview
```
- Faster build
- Includes dev tools
- Good for testing

**Production Build** (for release):
```bash
eas build --platform android --profile production
```
- Optimized build
- Smaller size
- Ready for Play Store

#### Build Process:
1. Command starts build on Expo servers
2. Wait 10-20 minutes for build to complete
3. Download APK from provided URL
4. Or check build status: `eas build:list`

### 3. Install and Test APK

#### Install APK on Device:
1. Download APK to your device
2. Enable "Install from Unknown Sources" in settings
3. Open APK file to install
4. Grant required permissions

#### Test Same Features:
- [ ] All screens load correctly
- [ ] Fonts display properly (compare with screenshots)
- [ ] Images show up (compare with screenshots)
- [ ] Colors match Expo Go version
- [ ] Navigation works smoothly
- [ ] Forms and inputs work
- [ ] Location features work
- [ ] Booking flow works

### 4. Side-by-Side Comparison

#### Visual Comparison Checklist:

**Fonts:**
- [ ] Same font family (Montserrat)
- [ ] Same font weights
- [ ] Same font sizes
- [ ] No missing characters

**Images:**
- [ ] All images display
- [ ] Same image quality
- [ ] No broken images
- [ ] Proper aspect ratios

**Colors:**
- [ ] Primary color (#004d43) matches
- [ ] Secondary color (#e8ee26) matches
- [ ] Background colors match
- [ ] Text colors match

**Layout:**
- [ ] Same spacing and padding
- [ ] Same component sizes
- [ ] Same screen layouts
- [ ] Proper safe area handling

**Functionality:**
- [ ] All buttons work
- [ ] Navigation works
- [ ] Forms submit correctly
- [ ] Location features work
- [ ] Firebase connection works

## Expected Results

### Should Be Identical:
- ✅ Font appearance
- ✅ Image display
- ✅ Color scheme
- ✅ Layout and spacing
- ✅ Component styling
- ✅ Feature functionality

### May Be Different (Normal):
- ⚡ Performance (APK faster)
- ⚡ Startup time (APK quicker)
- ⚡ App size (APK larger)
- ⚡ Debug features (Expo Go has more)

## Troubleshooting

### If Fonts Look Different:
```bash
# Rebuild with cache clear
eas build --platform android --profile preview --clear-cache
```

### If Images Are Missing:
1. Check images are in project directory
2. Verify `assetBundlePatterns` in app.json
3. Rebuild APK

### If Colors Look Different:
1. Check device display settings
2. Verify theme configuration
3. Compare in same lighting conditions

### If Layout Is Different:
1. Check device screen size
2. Verify safe area handling
3. Test on multiple devices

## Build Profiles

### Preview Profile (eas.json):
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  }
}
```

### Production Profile:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## Performance Comparison

### Expo Go:
- **Startup**: 3-5 seconds
- **Navigation**: Smooth
- **Bundle**: Downloaded on demand
- **Updates**: Instant (Metro bundler)

### APK:
- **Startup**: 1-2 seconds (faster)
- **Navigation**: Very smooth
- **Bundle**: Included in APK
- **Updates**: Requires new APK or OTA

## Deployment Checklist

Before deploying to production:
- [ ] Tested in Expo Go
- [ ] Built preview APK
- [ ] Tested preview APK
- [ ] Verified UI consistency
- [ ] Tested all features
- [ ] Checked performance
- [ ] Built production APK
- [ ] Final testing on production APK
- [ ] Ready for Play Store

## Quick Commands Reference

```bash
# Start Expo Go
npx expo start

# Clear cache and start
npx expo start --clear

# Build preview APK
eas build --platform android --profile preview

# Build production APK
eas build --platform android --profile production

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

## Summary

Your app is configured for UI consistency. Follow these steps:
1. Test in Expo Go ✅
2. Build APK with EAS ✅
3. Install and test APK ✅
4. Compare side-by-side ✅

The UI should look identical in both environments!