@echo off
echo ========================================
echo APK Crash Debugger
echo ========================================
echo.
echo This script will monitor your Android device for crash logs.
echo.
echo PREREQUISITES:
echo 1. Connect your Android device via USB
echo 2. Enable USB Debugging on your device
echo 3. Install ADB (Android Debug Bridge)
echo.
echo Press any key to start monitoring...
pause > nul

echo.
echo Checking for connected devices...
adb devices

echo.
echo Starting crash log monitor...
echo Press Ctrl+C to stop monitoring
echo.
echo ========================================
echo CRASH LOGS:
echo ========================================
echo.

REM Monitor for React Native and Android crashes
adb logcat -v time | findstr /i "ReactNativeJS AndroidRuntime FATAL ERROR Exception"

pause
