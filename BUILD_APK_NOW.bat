@echo off
echo ========================================
echo   Arena Pro - Build APK for Testing
echo ========================================
echo.
echo This will build an APK that you can install on your Android device.
echo The build will include:
echo   - Google Sign-In (fully working)
echo   - Password reset deep linking
echo   - All app features
echo.
echo Build time: 10-20 minutes
echo.
pause

echo.
echo Starting EAS build...
echo.

eas build --profile preview --platform android

echo.
echo ========================================
echo Build command executed!
echo.
echo Next steps:
echo 1. Wait for build to complete (check terminal or expo.dev)
echo 2. Download the APK from the link provided
echo 3. Install on your Android device
echo 4. Test all features!
echo ========================================
pause
