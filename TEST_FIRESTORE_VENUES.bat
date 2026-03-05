@echo off
echo ========================================
echo    TESTING FIRESTORE VENUES
echo ========================================
echo.
echo This will check if there are venues in your Firestore database...
echo.
pause

echo Running Firestore venues test...
node test-firestore-venues.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    TEST COMPLETED!
    echo ========================================
    echo.
    echo Check the output above for venue information.
    echo.
) else (
    echo.
    echo ========================================
    echo    TEST FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo Make sure your Firebase config is correct.
    echo.
)

pause