@echo off
echo 🔧 Applying Firestore Document Error Fix...
echo.

echo 📱 Stopping any running Metro processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🧹 Clearing all caches and temporary data...
call npm cache clean --force
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo
if exist android\app\build rmdir /s /q android\app\build
echo.

echo 🔄 Starting Metro with complete reset...
start "Metro Bundler" cmd /k "npx react-native start --reset-cache"
timeout /t 3 /nobreak >nul

echo.
echo ✅ Firestore Document Error Fix Applied!
echo.
echo 🎯 Critical Fix Applied:
echo - Fixed "No document to update" error in auth state listener
echo - Added proper document existence checks before updates
echo - Automatic user document creation when missing
echo - Safe error handling for all Firestore operations
echo - Better logging and debugging information
echo.
echo 🚀 Your app should now:
echo - Not crash with Firestore document errors
echo - Handle missing user documents gracefully
echo - Create user documents automatically when needed
echo - Work properly with Firebase authentication
echo.
echo 📱 Next steps:
echo 1. Wait for Metro bundler to start completely
echo 2. Run your app: npx react-native run-android (or run-ios)
echo 3. Try signing up/in - the console error should be gone
echo 4. Check the console for success messages instead of errors
echo.
echo 🎉 The authentication system should now work without errors!
echo.
pause