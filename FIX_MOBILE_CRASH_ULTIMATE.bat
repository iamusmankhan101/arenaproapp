@echo off
echo ========================================
echo 🔥 ULTIMATE MOBILE APP STABILIZER 🔥
echo ========================================
echo.
echo Phase 1: Removing native Firebase packages...
call npm uninstall @react-native-firebase/app @react-native-firebase/messaging

echo.
echo Phase 2: Cleaning node_modules...
echo (This ensures no orphaned native code remains)
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo.
echo Phase 3: Fresh Install...
call npm install

echo.
echo Phase 4: Clearing Expo Cache...
call npx expo start --clear

echo.
echo ========================================
echo ✅ CLEANUP COMPLETE!
echo.
echo Your app should now start without the 
echo "RNFBAppModule not found" error.
echo ========================================
pause
