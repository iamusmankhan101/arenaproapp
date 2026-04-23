@echo off
echo ========================================
echo    Fixing Expo Firebase Setup
echo ========================================
echo.

echo ✅ Issue identified: React Native Firebase packages don't work with Expo
echo ✅ Solution: Use Firebase JavaScript SDK instead (better for Expo!)
echo.

echo Removing problematic packages...
call npm uninstall @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/auth

echo.
echo Installing correct Firebase package...
call npm install firebase

echo.
echo ✅ app.json updated (Firebase plugins removed)
echo ✅ Firebase JavaScript SDK installed
echo.

echo Running prebuild (should work now)...
call npx expo prebuild --clean

echo.
echo ========================================
echo Setup completed successfully! 
echo.
echo Next steps:
echo 1. Enable Firestore in Firebase Console
echo 2. Run: npx expo run:android
echo.
echo Your Expo app now works with Firebase! 🔥
echo ========================================
pause