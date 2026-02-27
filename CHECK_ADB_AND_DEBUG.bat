@echo off
echo ========================================
echo APK Crash Debugger - Setup Check
echo ========================================
echo.

REM Set ADB path
set ADB_PATH=C:\adb\adb.exe

REM Check if ADB exists
if not exist "%ADB_PATH%" (
    echo [X] ADB not found at %ADB_PATH%
    echo.
    echo Please ensure ADB is installed at C:\adb\
    echo Or update the ADB_PATH in this script.
    pause
    exit /b 1
)

echo [OK] ADB is installed at %ADB_PATH%
echo.

REM Check for connected devices
echo Checking for connected Android devices...
"%ADB_PATH%" devices

echo.
echo ========================================
echo Device Status Check:
echo ========================================
echo.
echo If you see "unauthorized" above:
echo   1. Look at your phone screen
echo   2. You should see a popup asking to "Allow USB debugging"
echo   3. Check "Always allow from this computer"
echo   4. Tap "Allow" or "OK"
echo   5. Run this script again
echo.
echo If you see "device" (not unauthorized):
echo   - Your device is ready!
echo   - Press any key to start monitoring
echo.
echo If you see nothing listed:
echo   - Check USB cable connection
echo   - Try a different USB port
echo   - Enable USB Debugging in Developer Options
echo.
echo ========================================
pause

echo.
echo Starting crash log monitor...
echo Press Ctrl+C to stop
echo.
echo ========================================
echo INSTRUCTIONS:
echo 1. Open your APK on the phone
echo 2. Navigate to the screen that crashes
echo 3. Watch below for error messages
echo ========================================
echo.
echo CRASH LOGS:
echo ========================================
echo.

REM Monitor for crashes
"%ADB_PATH%" logcat -v time | findstr /i "ReactNativeJS AndroidRuntime FATAL ERROR Exception"
