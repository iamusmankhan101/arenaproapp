// Debug Booking Not Showing Issue
// This script helps identify why bookings aren't appearing after creation

const fs = require('fs');

console.log('🔍 DEBUGGING: Booking Not Showing Issue');
console.log('=====================================');

// Step 1: Check if booking creation is actually working
console.log('\n📋 STEP 1: Verify Booking Creation Process');

// Check createBooking function in firebaseAPI.js
const firebaseAPIPath = 'src/services/firebaseAPI.js';
if (fs.existsSync(firebaseAPIPath)) {
  const content = fs.readFileSync(firebaseAPIPath, 'utf8');
  
  // Look for the createBooking function
  const hasCreateBooking = content.includes('async createBooking(bookingData)');
  const hasVenueEnrichment = content.includes('getDoc(doc(db, \'venues\'');
  const hasDateTimeCreation = content.includes('dateTime: bookingDateTime.toISOString()');
  const hasBookingIdGeneration = content.includes('bookingId: `PIT${Date.now()');
  
  console.log(`   ${hasCreateBooking ? '✅' : '❌'} createBooking function exists: ${hasCreateBooking}`);
  console.log(`   ${hasVenueEnrichment ? '✅' : '❌'} Venue enrichment logic: ${hasVenueEnrichment}`);
  console.log(`   ${hasDateTimeCreation ? '✅' : '❌'} DateTime creation: ${hasDateTimeCreation}`);
  console.log(`   ${hasBookingIdGeneration ? '✅' : '❌'} BookingId generation: ${hasBookingIdGeneration}`);
  
  // Check for console.log statements that would help debug
  const hasDebugLogs = content.includes('console.log') || content.includes('console.error');
  console.log(`   ${hasDebugLogs ? '✅' : '⚠️ '} Debug logging present: ${hasDebugLogs}`);
} else {
  console.log('   ❌ Firebase API file not found');
}

// Step 2: Check getUserBookings function
console.log('\n📋 STEP 2: Verify Booking Retrieval Process');

if (fs.existsSync(firebaseAPIPath)) {
  const content = fs.readFileSync(firebaseAPIPath, 'utf8');
  
  const hasGetUserBookings = content.includes('async getUserBookings()');
  const hasUserIdQuery = content.includes('where(\'userId\', \'==\', user.uid)');
  const hasOrderBy = content.includes('orderBy(\'createdAt\', \'desc\')');
  
  console.log(`   ${hasGetUserBookings ? '✅' : '❌'} getUserBookings function exists: ${hasGetUserBookings}`);
  console.log(`   ${hasUserIdQuery ? '✅' : '❌'} User ID filtering: ${hasUserIdQuery}`);
  console.log(`   ${hasOrderBy ? '✅' : '❌'} Proper ordering: ${hasOrderBy}`);
}

// Step 3: Check Redux booking slice
console.log('\n📋 STEP 3: Verify Redux State Management');

const bookingSlicePath = 'src/store/slices/bookingSlice.js';
if (fs.existsSync(bookingSlicePath)) {
  const content = fs.readFileSync(bookingSlicePath, 'utf8');
  
  const hasFetchUserBookings = content.includes('fetchUserBookings');
  const hasCreateBookingAction = content.includes('createBooking');
  const hasUserBookingsState = content.includes('userBookings: []');
  const hasFulfilledCase = content.includes('fetchUserBookings.fulfilled');
  
  console.log(`   ${hasFetchUserBookings ? '✅' : '❌'} fetchUserBookings action: ${hasFetchUserBookings}`);
  console.log(`   ${hasCreateBookingAction ? '✅' : '❌'} createBooking action: ${hasCreateBookingAction}`);
  console.log(`   ${hasUserBookingsState ? '✅' : '❌'} userBookings state: ${hasUserBookingsState}`);
  console.log(`   ${hasFulfilledCase ? '✅' : '❌'} Fulfilled case handler: ${hasFulfilledCase}`);
} else {
  console.log('   ❌ Booking slice file not found');
}

// Step 4: Check BookingScreen implementation
console.log('\n📋 STEP 4: Verify BookingScreen Implementation');

const bookingScreenPath = 'src/screens/booking/BookingScreen.js';
if (fs.existsSync(bookingScreenPath)) {
  const content = fs.readFileSync(bookingScreenPath, 'utf8');
  
  const hasUseFocusEffect = content.includes('useFocusEffect');
  const hasFetchUserBookingsCall = content.includes('dispatch(fetchUserBookings())');
  const hasFilterBookings = content.includes('filterBookings');
  const hasBookingCardRender = content.includes('BookingCard');
  
  console.log(`   ${hasUseFocusEffect ? '✅' : '❌'} useFocusEffect hook: ${hasUseFocusEffect}`);
  console.log(`   ${hasFetchUserBookingsCall ? '✅' : '❌'} fetchUserBookings dispatch: ${hasFetchUserBookingsCall}`);
  console.log(`   ${hasFilterBookings ? '✅' : '❌'} Booking filtering logic: ${hasFilterBookings}`);
  console.log(`   ${hasBookingCardRender ? '✅' : '❌'} BookingCard rendering: ${hasBookingCardRender}`);
} else {
  console.log('   ❌ BookingScreen file not found');
}

// Step 5: Check BookingCard component
console.log('\n📋 STEP 5: Verify BookingCard Component');

const bookingCardPath = 'src/components/BookingCard.js';
if (fs.existsSync(bookingCardPath)) {
  const content = fs.readFileSync(bookingCardPath, 'utf8');
  
  const expectsDateTime = content.includes('booking.dateTime');
  const expectsTurfName = content.includes('booking.turfName');
  const expectsTurfArea = content.includes('booking.turfArea');
  const expectsSport = content.includes('booking.sport');
  const expectsStatus = content.includes('booking.status');
  
  console.log(`   ${expectsDateTime ? '✅' : '❌'} Expects dateTime field: ${expectsDateTime}`);
  console.log(`   ${expectsTurfName ? '✅' : '❌'} Expects turfName field: ${expectsTurfName}`);
  console.log(`   ${expectsTurfArea ? '✅' : '❌'} Expects turfArea field: ${expectsTurfArea}`);
  console.log(`   ${expectsSport ? '✅' : '❌'} Expects sport field: ${expectsSport}`);
  console.log(`   ${expectsStatus ? '✅' : '❌'} Expects status field: ${expectsStatus}`);
} else {
  console.log('   ❌ BookingCard file not found');
}

console.log('\n🔍 DEBUGGING RECOMMENDATIONS:');
console.log('=====================================');

console.log('\n1. 📱 CHECK CONSOLE LOGS:');
console.log('   • Open React Native Debugger');
console.log('   • Create a booking and watch for logs');
console.log('   • Look for "createBooking" success/error messages');
console.log('   • Check if "fetchUserBookings" is being called');

console.log('\n2. 🔥 CHECK FIREBASE CONSOLE:');
console.log('   • Go to Firestore Database');
console.log('   • Look for "bookings" collection');
console.log('   • Verify booking documents are being created');
console.log('   • Check if userId matches current user');

console.log('\n3. 🔄 CHECK REDUX STATE:');
console.log('   • Install Redux DevTools');
console.log('   • Watch for "booking/createBooking/fulfilled" actions');
console.log('   • Check if "userBookings" array is populated');
console.log('   • Verify state updates after fetchUserBookings');

console.log('\n4. 🐛 COMMON ISSUES TO CHECK:');
console.log('   • User authentication status');
console.log('   • Network connectivity');
console.log('   • Firebase rules permissions');
console.log('   • Date/time parsing errors');
console.log('   • Venue document existence');

console.log('\n5. 🧪 MANUAL TESTING STEPS:');
console.log('   • Create a booking');
console.log('   • Check Firebase console immediately');
console.log('   • Pull down to refresh in My Bookings');
console.log('   • Navigate away and back to My Bookings');
console.log('   • Check different filter tabs (Upcoming/Past)');

console.log('\n6. 🔧 QUICK FIXES TO TRY:');
console.log('   • Restart the app completely');
console.log('   • Clear app cache/data');
console.log('   • Check internet connection');
console.log('   • Try creating booking with different venue');

console.log('\n🚨 IF BOOKINGS STILL NOT SHOWING:');
console.log('=====================================');
console.log('The issue might be:');
console.log('• Authentication: User not properly signed in');
console.log('• Permissions: Firestore rules blocking reads');
console.log('• Data Structure: Booking data missing required fields');
console.log('• Network: API calls failing silently');
console.log('• State Management: Redux not updating properly');
console.log('• Component: BookingCard not rendering due to missing props');

console.log('\n💡 NEXT STEPS:');
console.log('1. Add more console.log statements to track the flow');
console.log('2. Check Firebase console for actual booking documents');
console.log('3. Verify user authentication and permissions');
console.log('4. Test with a simple hardcoded booking in Redux state');
console.log('5. Check if the issue is creation, retrieval, or display');