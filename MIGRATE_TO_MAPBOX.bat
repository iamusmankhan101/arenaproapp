@echo off
echo ========================================
echo   MAPBOX MIGRATION - COMPLETE SETUP
echo ========================================
echo.

echo Step 1: Installing Mapbox package (stable version)...
call npm install @rnmapbox/maps@10.1.30
if errorlevel 1 (
    echo ERROR: Failed to install Mapbox package
    pause
    exit /b 1
)
echo ✓ Mapbox package installed successfully
echo.

echo Step 2: Backing up current MapScreen.js...
copy src\screens\main\MapScreen.js src\screens\main\MapScreen.BACKUP.js
echo ✓ Backup created: MapScreen.BACKUP.js
echo.

echo Step 3: Replacing with Mapbox implementation...
copy src\screens\main\MapScreen.MAPBOX.js src\screens\main\MapScreen.js
echo ✓ MapScreen.js updated with Mapbox
echo.

echo Step 4: Clean install dependencies...
rmdir /s /q node_modules
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

echo ========================================
echo   MIGRATION COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Review the changes in MapScreen.js
echo 2. Test in Expo Go: npm start
echo 3. Build APK: eas build --profile preview --platform android
echo.
echo Configuration:
echo - Mapbox version: 10.1.30 (stable)
echo - Token: Configured in app.json
echo - Free tier: 50,000 map loads/month
echo.
pause
