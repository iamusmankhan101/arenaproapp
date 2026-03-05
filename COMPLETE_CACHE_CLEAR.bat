@echo off
echo ========================================
echo COMPLETE EXPO CACHE CLEAR
echo ========================================
echo.
echo This will:
echo 1. Delete .expo folder
echo 2. Clear npm cache
echo 3. Restart Expo with --clear flag
echo.
pause

echo.
echo [1/3] Deleting .expo folder...
if exist .expo (
    rmdir /s /q .expo
    echo ✓ .expo folder deleted
) else (
    echo ⚠ .expo folder not found (already clean)
)

echo.
echo [2/3] Clearing npm cache...
call npm cache clean --force
echo ✓ npm cache cleared

echo.
echo [3/3] Starting Expo with clean cache...
echo.
echo ========================================
echo IMPORTANT: On your device
echo ========================================
echo 1. Close Expo Go app completely (swipe away)
echo 2. Uninstall Expo Go from your device
echo 3. Reinstall Expo Go from Play Store/App Store
echo 4. Scan the QR code when it appears below
echo ========================================
echo.
pause

call npx expo start --clear

echo.
echo Done!
pause
