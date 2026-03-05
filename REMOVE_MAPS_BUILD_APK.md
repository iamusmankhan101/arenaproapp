# 🚀 Remove Maps Temporarily - Build APK Now

## Current Situation
- **Google Maps**: Cannot set up billing account ❌
- **Mapbox**: Maven repository build failures ❌
- **OpenStreetMap**: No native React Native support, requires major rewrite ❌

## Pragmatic Solution: Build Without Maps

### Why This Approach?
1. You need APK **NOW**
2. Map feature is blocking the build
3. You can add maps later after resolving billing/configuration issues
4. Rest of your app works perfectly

---

## Step 1: Uninstall Mapbox Package

```bash
npm uninstall @rnmapbox/maps
```

---

## Step 2: Disable MapScreen Temporarily

We'll make MapScreen show a "Coming Soon" message instead of crashing.

**File**: `src/screens/main/MapScreen.js`

Replace the entire file content with a simple placeholder:

```javascript
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

export default function MapScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="map" size={80} color={theme.colors.primary} />
        <Text style={styles.title}>Map View Coming Soon</Text>
        <Text style={styles.subtitle}>
          We're working on bringing you an amazing map experience to find venues near you.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
```

---

## Step 3: Remove Google Maps Config from app.json

**File**: `app.json`

Remove the Google Maps configuration:

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
  // REMOVE THIS SECTION:
  // "config": {
  //   "googleMaps": {
  //     "apiKey": "AIzaSyByv8v58hZXCf-uvvVOCbPAS5VKI9C7Co8"
  //   }
  // },
  "runtimeVersion": "1.0.0",
  ...
}
```

---

## Step 4: Clean Install Dependencies

```bash
npm install
```

---

## Step 5: Build APK

```bash
eas build --profile preview --platform android
```

---

## ✅ What You Get

1. **Working APK** - Builds successfully without map dependencies
2. **No crashes** - MapScreen shows "Coming Soon" message
3. **All other features work** - Bookings, venues, profiles, etc.
4. **Clean codebase** - No broken dependencies

---

## 🔮 Future: Add Maps Back

Once you resolve the billing or configuration issues:

### Option A: Google Maps (When Billing is Set Up)
1. Add back Google Maps config to `app.json`
2. Restore original `MapScreen.js` code
3. Rebuild APK

### Option B: Mapbox (When Maven is Fixed)
1. Install `@rnmapbox/maps`
2. Configure Mapbox plugin
3. Update `MapScreen.js` to use Mapbox
4. Rebuild APK

### Option C: Alternative Map Solutions
- **react-native-maps with OSM tiles**: Use OpenStreetMap tiles with react-native-maps
- **WebView-based maps**: Leaflet.js in a WebView
- **Static maps**: Show static map images from free APIs

---

## 🎯 Quick Commands (Copy & Paste)

```bash
# Uninstall Mapbox
npm uninstall @rnmapbox/maps

# Clean install
npm install

# Build APK
eas build --profile preview --platform android
```

---

## Summary

**Problem**: Both map providers have blocking issues  
**Solution**: Temporarily disable maps, build APK  
**Timeline**: 5 minutes to implement, 15-20 minutes to build  
**Result**: Working APK with all features except maps  

This gets your app in users' hands NOW, and you can add maps in the next update! 🚀
