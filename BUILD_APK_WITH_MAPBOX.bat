@echo off
echo ========================================
echo   BUILD APK WITH MAPBOX
echo ========================================
echo.

echo Checking EAS CLI installation...
call eas --version
if errorlevel 1 (
    echo ERROR: EAS CLI not found. Installing...
    call npm install -g eas-cli
)
echo.

echo Starting EAS build for Android...
echo This will take 15-20 minutes.
echo.
echo Build configuration:
echo - Platform: Android
echo - Profile: preview
echo - Map Provider: Mapbox
echo - Mapbox Version: 10.1.30
echo.

call eas build --profile preview --platform android

if errorlevel 1 (
    echo.
    echo ========================================
    echo   BUILD FAILED
    echo ========================================
    echo.
    echo Common issues:
    echo 1. Network connectivity - Check your internet
    echo 2. EAS account - Make sure you're logged in: eas login
    echo 3. Project configuration - Check app.json and eas.json
    echo.
    echo Check the error message above for details.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD STARTED SUCCESSFULLY!
echo ========================================
echo.
echo The build is now running on EAS servers.
echo You can:
echo 1. Monitor progress at: https://expo.dev/accounts/[your-account]/projects/arena-pro/builds
echo 2. Close this window - build continues on server
echo 3. Download APK when complete
echo.
echo Estimated time: 15-20 minutes
echo.
pause
