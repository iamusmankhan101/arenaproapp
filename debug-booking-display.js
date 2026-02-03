// Debug Booking Display Issues
// This script helps debug why bookings might not appear in My Bookings screen

const fs = require('fs');

console.log('🔍 Debugging Booking Display Issues...');

// Check 1: Verify createBooking function has been updated
console.log('\n📋 Check 1: createBooking Function Enhancement');
const firebaseAPIPath = 'src/services/firebaseAPI.js';
if (fs.existsSync(firebaseAPIPath)) {
  const content = fs.readFileSync(firebaseAPIPath, 'utf8');
  
  const hasVenueDetailsLogic = content.includes('getDoc(doc(db, \'venues\'');
  const hasDateTimeCreation = content.includes('dateTime: bookingDateTime.toISOString()');
  const hasDurationCalculation = content.includes('duration: `${durationHours} hour');
  const hasBookingIdField = content.includes('bookingId: `PIT${Date.now()');
  const hasTurfNameField = content.includes('turfName: venueData.name');
  
  console.log(`   ${hasVenueDetailsLogic ? '✅' : '❌'} Venue details fetching: ${hasVenueDetailsLogic ? 'Implemented' : 'Missing'}`);
  console.log(`   ${hasDateTimeCreation ? '✅' : '❌'} DateTime field creation: ${hasDateTimeCreation ? 'Implemented' : 'Missing'}`);
  console.log(`   ${hasDurationCalculation ? '✅' : '❌'} Duration calculation: ${hasDurationCalculation ? 'Implemented' : 'Missing'}`);
  console.log(`   ${hasBookingIdField ? '✅' : '❌'} BookingId field: ${hasBookingIdField ? 'Implemented' : 'Missing'}`);
  console.log(`   ${hasTurfNameField ? '✅' : '❌'} TurfName field: ${hasTurfNameField ? 'Implemented' : 'Missing'}`);
} else {
  console.log('   ❌ Firebase API file not found');
}

// Check 2: Verify BookingConfirmScreen refresh logic
console.log('\n📋 Check 2: BookingConfirmScreen Refresh Logic');
const bookingConfirmPath = 'src/screens/booking/BookingConfirmScreen.js';
if (fs.existsSync(bookingConfirmPath)) {
  const content = fs.readFileSync(bookingConfirmPath, 'utf8');
  
  const hasFetchUserBookingsImport = content.includes('fetchUserBookings');
  const hasRefreshCall = content.includes('dispatch(fetchUserBookings())');
  
  console.log(`   ${hasFetchUserBookingsImport ? '✅' : '❌'} fetchUserBookings import: ${hasFetchUserBookingsImport ? 'Present' : 'Missing'}`);
  console.log(`   ${hasRefreshCall ? '✅' : '❌'} Refresh call in success handler: ${hasRefreshCall ? 'Present' : 'Missing'}`);
} else {
  console.log('   ❌ BookingConfirmScreen file not found');
}

// Check 3: Verify BookingScreen focus refresh
console.log('\n📋 Check 3: BookingScreen Focus Refresh');
const bookingScreenPath = 'src/screens/booking/BookingScreen.js';
if (fs.existsSync(bookingScreenPath)) {
  const content = fs.readFileSync(bookingScreenPath, 'utf8');
  
  const hasUseFocusEffect = content.includes('useFocusEffect');
  const hasFocusEffectImport = content.includes('useFocusEffect') && content.includes('@react-navigation/native');
  const hasOnRefreshFunction = content.includes('const onRefresh');
  
  console.log(`   ${hasFocusEffectImport ? '✅' : '❌'} useFocusEffect import: ${hasFocusEffectImport ? 'Present' : 'Missing'}`);
  console.log(`   ${hasUseFocusEffect ? '✅' : '❌'} useFocusEffect implementation: ${hasUseFocusEffect ? 'Present' : 'Missing'}`);
  console.log(`   ${hasOnRefreshFunction ? '✅' : '❌'} onRefresh function: ${hasOnRefreshFunction ? 'Present' : 'Missing'}`);
} else {
  console.log('   ❌ BookingScreen file not found');
}

// Check 4: Verify BookingCard component expectations
console.log('\n📋 Check 4: BookingCard Component Requirements');
const bookingCardPath = 'src/components/BookingCard.js';
if (fs.existsSync(bookingCardPath)) {
  const content = fs.readFileSync(bookingCardPath, 'utf8');
  
  const usesDateTime = content.includes('booking.dateTime');
  const usesTurfName = content.includes('booking.turfName');
  const usesTurfArea = content.includes('booking.turfArea');
  const usesSport = content.includes('booking.sport');
  const usesBookingId = content.includes('booking.bookingId');
  
  console.log(`   ${usesDateTime ? '✅' : '❌'} Expects dateTime field: ${usesDateTime ? 'Yes' : 'No'}`);
  console.log(`   ${usesTurfName ? '✅' : '❌'} Expects turfName field: ${usesTurfName ? 'Yes' : 'No'}`);
  console.log(`   ${usesTurfArea ? '✅' : '❌'} Expects turfArea field: ${usesTurfArea ? 'Yes' : 'No'}`);
  console.log(`   ${usesSport ? '✅' : '❌'} Expects sport field: ${usesSport ? 'Yes' : 'No'}`);
  console.log(`   ${usesBookingId ? '✅' : '❌'} Expects bookingId field: ${usesBookingId ? 'Yes' : 'No'}`);
} else {
  console.log('   ❌ BookingCard file not found');
}

// Check 5: Verify Redux booking slice
console.log('\n📋 Check 5: Redux Booking Slice');
const bookingSlicePath = 'src/store/slices/bookingSlice.js';
if (fs.existsSync(bookingSlicePath)) {
  const content = fs.readFileSync(bookingSlicePath, 'utf8');
  
  const hasFetchUserBookings = content.includes('fetchUserBookings');
  const hasCreateBooking = content.includes('createBooking');
  const hasUserBookingsState = content.includes('userBookings: []');
  
  console.log(`   ${hasFetchUserBookings ? '✅' : '❌'} fetchUserBookings action: ${hasFetchUserBookings ? 'Present' : 'Missing'}`);
  console.log(`   ${hasCreateBooking ? '✅' : '❌'} createBooking action: ${hasCreateBooking ? 'Present' : 'Missing'}`);
  console.log(`   ${hasUserBookingsState ? '✅' : '❌'} userBookings state: ${hasUserBookingsState ? 'Present' : 'Missing'}`);
} else {
  console.log('   ❌ BookingSlice file not found');
}

console.log('\n🔍 Debug Complete!');
console.log('\n📝 Debugging Steps for Users:');
console.log('1. Open React Native Debugger or browser console');
console.log('2. Create a booking and watch for console logs');
console.log('3. Check if createBooking API call succeeds');
console.log('4. Verify booking data structure in Firebase console');
console.log('5. Check if fetchUserBookings is called after booking creation');
console.log('6. Verify Redux state updates in Redux DevTools');
console.log('7. Check if BookingCard receives proper data');

console.log('\n🚨 Common Issues to Check:');
console.log('• Network connectivity during booking creation');
console.log('• Firebase authentication status');
console.log('• Venue document exists in Firestore');
console.log('• Date/time parsing errors');
console.log('• Redux state not updating');
console.log('• Component not re-rendering after state change');

console.log('\n💡 Quick Fixes:');
console.log('• Pull down to refresh in My Bookings screen');
console.log('• Navigate away and back to My Bookings');
console.log('• Check Firebase console for booking documents');
console.log('• Restart the app if Redux state is corrupted');