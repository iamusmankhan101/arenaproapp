@echo off
echo ========================================
echo FORCE ADMIN PANEL REFRESH
echo ========================================
echo.
echo The booking should be showing in the admin panel now.
echo If it's still not showing, this script will help refresh everything.
echo.
echo Step 1: Clear admin panel cache
echo ================================
cd admin-web
if exist node_modules\.cache (
    echo Clearing admin panel cache...
    rmdir /s /q node_modules\.cache
    echo ✅ Cache cleared
) else (
    echo ℹ️ No cache to clear
)

echo.
echo Step 2: Clear browser data
echo ==========================
echo Please do the following in your browser:
echo 1. Press Ctrl+Shift+Delete
echo 2. Select "All time" for time range
echo 3. Check "Cached images and files"
echo 4. Check "Cookies and other site data"
echo 5. Click "Clear data"
echo.
pause

echo.
echo Step 3: Restart admin panel
echo ============================
echo Stopping any running admin processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting fresh admin panel...
start cmd /k "npm start"

echo.
echo Step 4: Test the fix
echo ====================
echo 1. Wait for admin panel to start (usually takes 30-60 seconds)
echo 2. Open browser and go to admin panel
echo 3. Navigate to Bookings Management
echo 4. You should now see 1 booking: PIT407220
echo.
echo If booking still doesn't show:
echo - Check browser console for errors (F12)
echo - Try different browser (Chrome, Firefox, Edge)
echo - Check network tab for failed API calls
echo.
echo Expected booking details:
echo - Booking ID: PIT407220
echo - Customer: Guest User  
echo - Venue: two (DHA)
echo - Amount: PKR 2000
echo - Status: pending
echo.
pause