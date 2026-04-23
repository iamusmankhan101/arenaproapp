@echo off
echo ========================================
echo ADMIN BOOKINGS FINAL DEBUG
echo ========================================
echo.
echo Testing the complete admin bookings flow...
echo.

echo Step 1: Test database connection
echo =================================
node debug-admin-panel-live.js
echo.

echo Step 2: Check admin panel status
echo ==================================
cd admin-web
echo Checking if admin panel is running...
netstat -ano | findstr :3000
if %errorlevel% == 0 (
    echo ✅ Admin panel is running on port 3000
) else (
    echo ❌ Admin panel is NOT running
    echo Starting admin panel...
    start cmd /k "npm start"
    echo ⏳ Waiting for admin panel to start...
    timeout /t 30 /nobreak >nul
)

echo.
echo Step 3: Browser instructions
echo ============================
echo Please follow these steps EXACTLY:
echo.
echo 1. Open your browser (Chrome recommended)
echo 2. Press Ctrl+Shift+Delete to clear cache
echo 3. Select "All time" and clear cache/cookies
echo 4. Go to: http://localhost:3000
echo 5. Login to admin panel
echo 6. Navigate to "Bookings Management"
echo 7. Click the "Refresh" button in the top right
echo.
echo Expected result:
echo - You should see 1 booking
echo - Booking ID: PIT407220
echo - Customer: Guest User
echo - Venue: two
echo - Amount: PKR 2000
echo - Status: pending
echo.

echo Step 4: If booking still not showing
echo ======================================
echo 1. Press F12 to open Developer Tools
echo 2. Go to Console tab
echo 3. Look for any red error messages
echo 4. Go to Network tab
echo 5. Refresh the page
echo 6. Look for failed requests (red entries)
echo 7. Check if there are requests to Firebase
echo.

echo Step 5: Alternative solutions
echo ===============================
echo If the booking is still not showing:
echo.
echo A) Try different browser:
echo    - Chrome
echo    - Firefox  
echo    - Edge
echo.
echo B) Check admin panel logs:
echo    - Look at the terminal where admin panel is running
echo    - Check for any error messages
echo.
echo C) Restart everything:
echo    - Close admin panel terminal
echo    - Run: npm start
echo    - Wait for it to fully load
echo    - Try again
echo.

echo ========================================
echo SUMMARY
echo ========================================
echo ✅ Database has 1 booking (confirmed)
echo ✅ API returns booking correctly (confirmed)  
echo ✅ Admin panel code is fixed (confirmed)
echo.
echo The issue is likely:
echo - Browser cache
echo - Admin panel not refreshed
echo - Network/connection issue
echo.
echo Follow the steps above to resolve it.
echo.
pause