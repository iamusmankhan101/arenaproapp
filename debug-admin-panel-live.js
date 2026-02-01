// Debug Admin Panel Live - Test Actual Admin API Flow
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simulate EXACT admin panel API call
async function simulateExactAdminPanelCall() {
  try {
    console.log('🔍 SIMULATING EXACT ADMIN PANEL API CALL');
    console.log('=========================================');
    
    // This is exactly what the admin panel calls
    const params = {
      page: 0,
      pageSize: 25,
      filter: 'all',
      search: ''
    };
    
    console.log('📋 Admin Panel Parameters:', params);
    console.log('');
    
    // Step 1: Initialize Firebase (same as workingFirebaseAPI.js)
    console.log('🔥 Step 1: Initialize Firebase');
    const firestore = db; // Already initialized
    console.log('✅ Firebase initialized');
    
    // Step 2: Create query for bookings collection
    console.log('🔍 Step 2: Create bookings query');
    let bookingsQuery = collection(firestore, 'bookings');
    
    // Step 3: Add ordering by creation date (newest first)
    console.log('📅 Step 3: Add ordering');
    try {
      bookingsQuery = query(bookingsQuery, orderBy('createdAt', 'desc'));
      console.log('✅ Ordering by createdAt added');
    } catch (orderError) {
      console.warn('⚠️ Could not order by createdAt:', orderError.message);
    }
    
    // Step 4: Execute query
    console.log('🚀 Step 4: Execute query');
    const querySnapshot = await getDocs(bookingsQuery);
    console.log(`📊 Query returned ${querySnapshot.size} documents`);
    
    if (querySnapshot.size === 0) {
      console.log('❌ PROBLEM: No bookings returned from query');
      console.log('   This explains why admin panel shows "No rows"');
      return;
    }
    
    // Step 5: Get venue names for better display
    console.log('🏟️ Step 5: Fetch venues for lookup');
    const venuesRef = collection(firestore, 'venues');
    const venuesSnapshot = await getDocs(venuesRef);
    const venuesMap = {};
    venuesSnapshot.forEach((doc) => {
      venuesMap[doc.id] = doc.data();
    });
    console.log(`📊 Found ${venuesSnapshot.size} venues for lookup`);
    
    // Step 6: Process results
    console.log('⚙️ Step 6: Process booking results');
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const bookingData = doc.data();
      console.log(`📋 Processing booking ${doc.id}:`, {
        status: bookingData.status,
        userId: bookingData.userId,
        turfId: bookingData.turfId,
        totalAmount: bookingData.totalAmount,
        bookingReference: bookingData.bookingReference
      });
      
      // Get venue information
      const venue = venuesMap[bookingData.turfId] || {};
      console.log(`🏟️ Venue lookup for ${bookingData.turfId}:`, {
        found: !!venue.name,
        name: venue.name,
        area: venue.area
      });
      
      // Transform booking data for admin panel display
      const transformedBooking = {
        id: doc.id,
        bookingId: bookingData.bookingReference || doc.id.slice(-6),
        customerName: bookingData.guestInfo?.name || bookingData.customerName || 'Guest User',
        customerPhone: bookingData.guestInfo?.phone || bookingData.customerPhone || 'N/A',
        customerEmail: bookingData.guestInfo?.email || bookingData.customerEmail || 'N/A',
        turfName: venue.name || bookingData.turf?.name || 'Unknown Venue',
        turfArea: venue.area || venue.address || bookingData.turf?.address || 'N/A',
        sport: bookingData.sport || (venue.sports && venue.sports[0]) || 'Football',
        dateTime: bookingData.date ? (bookingData.date.toDate ? bookingData.date.toDate() : new Date(bookingData.date)) : new Date(),
        duration: bookingData.duration || 1,
        totalAmount: bookingData.totalAmount || 0,
        status: bookingData.status || 'pending',
        paymentStatus: bookingData.paymentStatus || 'pending',
        timeSlot: bookingData.timeSlot || bookingData.slot?.startTime || 'N/A',
        // Ensure dates are properly formatted
        createdAt: bookingData.createdAt?.toDate?.() || new Date(),
        updatedAt: bookingData.updatedAt?.toDate?.() || new Date(),
        // Additional fields for admin
        userId: bookingData.userId,
        userType: bookingData.userType || 'guest',
        turfId: bookingData.turfId,
      };
      
      console.log(`✅ Transformed booking:`, {
        bookingId: transformedBooking.bookingId,
        customerName: transformedBooking.customerName,
        turfName: transformedBooking.turfName,
        status: transformedBooking.status,
        totalAmount: transformedBooking.totalAmount
      });
      
      bookings.push(transformedBooking);
    });
    
    console.log(`📊 Total bookings processed: ${bookings.length}`);
    
    // Step 7: Apply filters (admin panel sends filter: 'all')
    console.log('🔍 Step 7: Apply filters');
    let filteredBookings = bookings;
    
    if (params.filter && params.filter !== 'all') {
      console.log(`🔍 Filtering by: ${params.filter}`);
      if (params.filter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        filteredBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.dateTime);
          return bookingDate >= today && bookingDate < tomorrow;
        });
      } else {
        filteredBookings = bookings.filter(booking => booking.status === params.filter);
      }
    } else {
      console.log('✅ No filtering applied (showing all bookings)');
    }
    
    console.log(`📊 Filtered bookings: ${filteredBookings.length}`);
    
    // Step 8: Apply search (admin panel sends empty search)
    console.log('🔍 Step 8: Apply search');
    if (params.search) {
      console.log(`🔍 Searching for: ${params.search}`);
      const searchLower = params.search.toLowerCase();
      filteredBookings = filteredBookings.filter(booking => 
        booking.customerName.toLowerCase().includes(searchLower) ||
        booking.turfName.toLowerCase().includes(searchLower) ||
        booking.bookingId.toLowerCase().includes(searchLower) ||
        booking.customerPhone.includes(params.search)
      );
    } else {
      console.log('✅ No search applied');
    }
    
    console.log(`📊 Search results: ${filteredBookings.length}`);
    
    // Step 9: Apply pagination
    console.log('📄 Step 9: Apply pagination');
    const startIndex = (parseInt(params.page) || 0) * (parseInt(params.pageSize) || 25);
    const endIndex = startIndex + (parseInt(params.pageSize) || 25);
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);
    
    console.log(`📊 Pagination: ${startIndex}-${endIndex} of ${filteredBookings.length}`);
    console.log(`📊 Paginated results: ${paginatedBookings.length}`);
    
    // Step 10: Create final result
    const result = {
      data: paginatedBookings,
      total: filteredBookings.length,
      page: parseInt(params.page) || 0,
      pageSize: parseInt(params.pageSize) || 25
    };
    
    console.log('');
    console.log('🎯 FINAL RESULT FOR ADMIN PANEL:');
    console.log('================================');
    console.log(`📊 Data: ${result.data.length} bookings`);
    console.log(`📊 Total: ${result.total}`);
    console.log(`📊 Page: ${result.page}`);
    console.log(`📊 Page Size: ${result.pageSize}`);
    
    if (result.data.length > 0) {
      console.log('✅ SUCCESS: Admin panel SHOULD show bookings');
      console.log('');
      console.log('📋 Bookings that should appear in admin panel:');
      result.data.forEach((booking, i) => {
        console.log(`   ${i + 1}. ${booking.bookingId} - ${booking.customerName} - ${booking.turfName} - PKR ${booking.totalAmount} - ${booking.status}`);
      });
    } else {
      console.log('❌ PROBLEM: Admin panel will show "No rows"');
      console.log('   Even though we processed bookings, final result is empty');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error in admin panel simulation:', error);
    console.error('   Stack:', error.stack);
  }
}

async function debugAdminPanelLive() {
  try {
    console.log('🧪 DEBUGGING ADMIN PANEL LIVE ISSUE');
    console.log('===================================');
    console.log('This simulates the EXACT flow that the admin panel uses');
    console.log('');
    
    await simulateExactAdminPanelCall();
    
    console.log('');
    console.log('🔧 TROUBLESHOOTING STEPS:');
    console.log('=========================');
    console.log('1. If bookings are processed but final result is empty:');
    console.log('   - Check filtering logic');
    console.log('   - Check pagination logic');
    console.log('   - Check data transformation');
    console.log('');
    console.log('2. If no bookings are returned from query:');
    console.log('   - Check Firebase connection');
    console.log('   - Check collection name ("bookings")');
    console.log('   - Check Firestore rules');
    console.log('');
    console.log('3. If admin panel still shows "No rows":');
    console.log('   - Clear browser cache');
    console.log('   - Hard refresh (Ctrl+F5)');
    console.log('   - Check browser console for errors');
    console.log('   - Check network tab for API calls');
    
    console.log('');
    console.log('✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug
debugAdminPanelLive().then(() => {
  console.log('🏁 Debug finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});