@echo off
echo ========================================
echo    Fixing Admin Panel Errors
echo ========================================
echo.

echo ✅ Fixed manifest.json issue
echo ✅ Updated auth to use mock authentication
echo ✅ Removed REST API dependencies
echo.

echo Clearing admin panel cache...
cd admin-web
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist build rmdir /s /q build

echo.
echo Installing/updating dependencies...
call npm install

echo.
echo Starting admin panel with fixes...
call npm start

echo.
echo ========================================
echo Admin panel should now work without errors!
echo.
echo Login credentials:
echo Email: admin@pitchit.com
echo Password: admin123
echo.
echo OR
echo Email: manager@pitchit.com  
echo Password: manager123
echo ========================================
pause