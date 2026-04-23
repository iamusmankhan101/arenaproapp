# 🔧 Uninstall Mapbox Package - Final Fix

## Problem
Even though we removed the Mapbox plugin from `app.json`, the package is still installed in `node_modules`, causing the build to fail.

Build log shows:
```
> Configure project :rnmapbox_maps
⚠️ RNMapbox DEPRECATION WARNING...
Could not find com.mapbox.maps:android-ndk27:11.16.2
```

## Solution: Uninstall Mapbox Package

### Step 1: Uninstall Package
```bash
npm uninstall @rnmapbox/maps
```

### Step 2: Clean Install
```bash
rm -rf node_modules
npm install
```

### Step 3: Verify Removal
```bash
# Check package.json - @rnmapbox/maps should be gone
cat package.json | grep mapbox
```

### Step 4: Build APK
```bash
eas build --profile preview --platform android
```

---

## Quick Commands (Copy & Paste)

```bash
npm uninstall @rnmapbox/maps
npm install
eas build --profile preview --platform android
```

---

## What This Does

1. **Removes** `@rnmapbox/maps` from `package.json`
2. **Deletes** Mapbox from `node_modules`
3. **Reinstalls** all other packages
4. **Build** will no longer try to compile Mapbox

---

## ✅ After This

Your app will have:
- ✅ Google Maps (working)
- ✅ No Mapbox package
- ✅ Clean build
- ✅ APK will compile successfully

---

## 🎯 Summary

**Problem**: Mapbox package still installed  
**Solution**: `npm uninstall @rnmapbox/maps`  
**Result**: Build will succeed with Google Maps only  

Run the commands above and build again! 🚀
