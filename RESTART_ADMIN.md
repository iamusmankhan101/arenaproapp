# Restart Admin Panel Instructions

The hard-coded data has been removed from both the mobile app and admin panel. To see the changes:

## For Admin Panel:

1. **Stop the current admin panel** if it's running (Ctrl+C)

2. **Clear browser cache** to ensure new code is loaded:
   - Chrome/Edge: Ctrl+Shift+R or F12 → Application → Storage → Clear storage
   - Firefox: Ctrl+Shift+R or F12 → Storage → Clear All

3. **Restart the admin panel**:
   ```bash
   cd admin-web
   npm start
   ```

4. **Verify the changes**:
   - Dashboard should show zeros or loading states instead of hard-coded values
   - Bookings, Venues, and Customers pages should show empty states
   - Check browser console for API calls (should see 404 errors instead of mock data logs)

## For Mobile App:

1. **Restart the Metro bundler**:
   ```bash
   npx react-native start --reset-cache
   ```

2. **Rebuild the app** (if needed):
   ```bash
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

## What Changed:

### ✅ Removed Hard-coded Data From:
- Home screen venue listings
- Challenge data  
- Admin dashboard stats
- Admin bookings, venues, customers data
- Venue list screen
- Turf detail screen venue database

### ✅ Updated API Configuration:
- Disabled mock data by default
- API failures now return empty data instead of mock data
- Added proper loading states
- Environment variables properly configured

### ✅ Real API Integration Ready:
- All endpoints configured for real API calls
- Proper error handling without mock fallbacks
- Loading states and empty states implemented

## Next Steps:

1. **Set up your backend API** with the endpoints listed in `API_INTEGRATION_GUIDE.md`
2. **Update API URLs** in configuration files to point to your real API
3. **Test each feature** to ensure proper integration

The app will now show empty states or loading indicators when API calls fail, instead of showing hard-coded mock data.