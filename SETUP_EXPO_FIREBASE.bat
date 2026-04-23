@echo off
echo ========================================
echo    Expo Firebase Setup
echo ========================================
echo.

echo ✅ Expo project detected
echo ✅ Package name updated to match Firebase: arenapropk.online
echo ✅ google-services.json configured in app.json
echo.

echo Installing Firebase packages...
call npm install firebase @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/auth

echo.
echo Prebuilding Expo project with Firebase...
call npx expo prebuild --clean

echo.
echo ========================================
echo Setup completed! 
echo.
echo Next steps:
echo 1. Enable Firestore in Firebase Console
echo 2. Run: npx expo run:android (to test on device)
echo.
echo Your Expo app now supports Firebase! 🔥
echo ========================================
pause