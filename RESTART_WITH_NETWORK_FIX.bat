@echo off
echo 🔧 Restarting React Native with Network Error Fix...
echo.

echo 📱 Stopping any running Metro processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🧹 Clearing caches...
call npm cache clean --force
echo.

echo 🔄 Starting Metro with reset cache...
start "Metro Bundler" cmd /k "npx react-native start --reset-cache"
timeout /t 3 /nobreak >nul

echo.
echo ✅ Development environment restarted with network error fixes!
echo.
echo 📋 What was fixed:
echo - Enhanced Firebase configuration with network retry
echo - Added automatic retry logic for failed requests
echo - Improved error handling and user messages
echo - Added network connectivity checks
echo - Implemented timeout handling
echo.
echo 🚀 Next steps:
echo 1. Wait for Metro bundler to start completely
echo 2. Run your React Native app (npx react-native run-android/ios)
echo 3. Test authentication - network errors should be resolved
echo.
echo 🆘 If you still have issues:
echo - Read NETWORK_ERROR_TROUBLESHOOTING.md
echo - Run: node debug-firebase-network-error.js
echo - Run: node test-network-fix.js
echo.
pause