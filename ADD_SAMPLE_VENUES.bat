@echo off
echo ========================================
echo    ADDING SAMPLE VENUES TO FIRESTORE
echo ========================================
echo.
echo This will add 3 sample venues to your Firestore database...
echo This will help test the real-time sync functionality.
echo.
pause

echo Adding sample venues...
node add-sample-venues.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    VENUES ADDED SUCCESSFULLY!
    echo ========================================
    echo.
    echo Sample venues have been added to Firestore.
    echo Your app should now be able to sync and display them.
    echo.
    echo Try refreshing your app to see the venues.
    echo.
) else (
    echo.
    echo ========================================
    echo    FAILED TO ADD VENUES!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo Make sure your Firebase config is correct.
    echo.
)

pause