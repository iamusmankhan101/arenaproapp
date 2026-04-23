@echo off
echo ========================================
echo    Android Firebase Setup
echo ========================================
echo.

echo Checking for google-services.json...
if not exist "google-services.json" (
    echo ❌ google-services.json not found in project root
    echo Please download it from Firebase Console and place it in the project root
    pause
    exit /b 1
)
echo ✅ Found google-services.json

echo.
echo Moving google-services.json to android/app/ directory...
if not exist "android\app" (
    echo ❌ android/app directory not found
    echo Make sure you're in the React Native project root
    pause
    exit /b 1
)

copy "google-services.json" "android\app\google-services.json"
if %errorlevel% equ 0 (
    echo ✅ google-services.json moved to android/app/
) else (
    echo ❌ Failed to move google-services.json
    pause
    exit /b 1
)

echo.
echo ========================================
echo Next Steps:
echo.
echo 1. Update android/build.gradle with:
echo    classpath("com.google.gms:google-services:4.4.4")
echo.
echo 2. Update android/app/build.gradle with:
echo    apply plugin: "com.google.gms.google-services"
echo.
echo 3. Install Firebase packages:
echo    npm install @react-native-firebase/app @react-native-firebase/firestore
echo.
echo 4. Clean and rebuild:
echo    cd android ^&^& ./gradlew clean ^&^& cd .. ^&^& npx react-native run-android
echo.
echo See ANDROID_FIREBASE_SETUP.md for detailed instructions
echo ========================================
pause