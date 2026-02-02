@echo off
echo.
echo ========================================
echo   FIXING ADMIN CUSTOMERS LOADING ISSUE
echo ========================================
echo.

echo 🔧 Applying fix...
node fix-admin-customers-loading.js

echo.
echo 🔄 Restarting admin panel...
cd admin-web

echo.
echo 📋 Starting admin panel with enhanced debugging...
echo    - Check browser console for debug messages
echo    - Look for "CustomersPage: Component state debug"
echo    - Verify DataGrid displays customer data
echo.

start npm start

echo.
echo ✅ Admin panel starting...
echo    Open http://localhost:3000 and navigate to Customers page
echo.
echo 🔍 If customers still don't load:
echo    1. Check browser console for errors
echo    2. Verify Network tab shows API calls
echo    3. Check Redux DevTools for state
echo.
pause