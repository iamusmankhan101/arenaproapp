// Test Complete Admin Bookings Functionality
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc } = require('firebase/firestore');

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

// Simulate the complete admin getBookings function with venue lookup
async function simulateCompleteAdminGetBookings(params = {}) {
  try {
    console.log('📅 Admin: Fetching bookings with venue lookup...');
    
    // Create query for bookings collection
    let bookingsQuery = collection(db, 'bookings');
    
    // Add ordering by creation date (newest first)
    try {
      bookingsQuery = query(bookingsQuery, orderBy('createdAt', 'desc'));
    } catch (orderError) {
      console.warn('⚠️ Admin: Could not order by createdAt, using simple query');
    }
    
    // Execute query
    const querySnapshot = await getDocs(bookingsQuery);
    
    // Get venue names for better display
    const venuesRef = collection(db, 'venues');
    const venuesSnapshot = await getDocs(venuesRef);
    const venuesMap = {};
    venuesSnapshot.forEach((doc) => {
      venuesMap[doc.id] = doc.data();
    });
    
    console.log(`📊 Admin: Found ${venuesSnapshot.size} venues for lookup`);
    
    // Process results
    const bookings = [];
    querySnapshot.forEach((doc) => {
      const bookingData = doc.data();
      
      // Get venue information
      const venue = venuesMap[bookingData.turfId] || {};
      
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
      
      bookings.push(transformedBooking);
    });
    
    // Apply pagination
    const startIndex = (parseInt(params.page) || 0) * (parseInt(params.pageSize) || 25);
    const endIndex = startIndex + (parseInt(params.pageSize) || 25);
    const paginatedBookings = bookings.slice(startIndex, endIndex);
    
    const result = {
      data: paginatedBookings,
      total: bookings.length,
      page: parseInt(params.page) || 0,
      pageSize: parseInt(params.pageSize) || 25
    };
    
    console.log(`✅ Admin: Complete bookings fetched: ${paginatedBookings.length}/${bookings.length} bookings`);
    return result;
    
  } catch (error) {
    console.error('❌ Admin: Error fetching bookings:', error);
    return {
      data: [],
      total: 0,
      page: parseInt(params.page) || 0,
      pageSize: parseInt(params.pageSize) || 25
    };
  }
}

async function testCompleteAdminBookings() {
  try {
    console.log('🧪 TESTING COMPLETE ADMIN BOOKINGS FUNCTIONALITY');
    console.log('================================================');
    
    // Test fetching bookings with venue lookup
    console.log('\n📋 TEST: Fetch Bookings with Venue Names');
    console.log('=========================================');
    
    const result = await simulateCompleteAdminGetBookings({});
    
    console.log(`📊 Results: ${result.data.length} bookings returned`);
    console.log(`📊 Total: ${result.total} bookings in database`);
    
    if (result.data.length > 0) {
      console.log('✅ SUCCESS: Admin panel would show bookings with proper venue names');
      console.log('   Detailed booking information:');
      result.data.forEach((booking, i) => {
        console.log(`   ${i + 1}. Booking ${booking.bookingId}:`);
        console.log(`      Customer: ${booking.customerName} (${booking.customerPhone})`);
        console.log(`      Venue: ${booking.turfName} (${booking.turfArea})`);
        console.log(`      Sport: ${booking.sport}`);
        console.log(`      Date: ${booking.dateTime.toLocaleDateString()}`);
        console.log(`      Time Slot: ${booking.timeSlot}`);
        console.log(`      Amount: PKR ${booking.totalAmount}`);
        console.log(`      Status: ${booking.status} | Payment: ${booking.paymentStatus}`);
        console.log(`      User Type: ${booking.userType}`);
        console.log('      ---');
      });
    } else {
      console.log('❌ PROBLEM: Admin panel would still show "No rows"');
    }
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testCompleteAdminBookings().then(() => {
  console.log('🏁 Test finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});