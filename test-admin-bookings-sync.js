// Test Admin Bookings Sync
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

// Simulate the updated admin getBookings function
async function simulateAdminGetBookings(params = {}) {
  try {
    console.log('📅 Admin: Fetching bookings...');
    
    // Create query for bookings collection
    let bookingsQuery = collection(db, 'bookings');
    
    // Add ordering by creation date (newest first)
    try {
      bookingsQuery = query(bookingsQuery, orderBy('createdAt', 'desc'));
    } catch (orderError) {
      console.warn('⚠️ Admin: Could not order by createdAt, using simple query');
      // If ordering fails, use simple query
    }
    
    // Execute query
    const querySnapshot = await getDocs(bookingsQuery);
    
    // Process results
    const bookings = [];
    querySnapshot.forEach((doc) => {
      const bookingData = doc.data();
      
      // Transform booking data for admin panel display
      const transformedBooking = {
        id: doc.id,
        bookingId: bookingData.bookingReference || doc.id.slice(-6),
        customerName: bookingData.guestInfo?.name || bookingData.customerName || 'Guest User',
        customerPhone: bookingData.guestInfo?.phone || bookingData.customerPhone || 'N/A',
        customerEmail: bookingData.guestInfo?.email || bookingData.customerEmail || 'N/A',
        turfName: bookingData.turf?.name || 'Unknown Venue',
        turfArea: bookingData.turf?.address || 'N/A',
        sport: bookingData.sport || 'Football',
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
    
    // Apply filters if specified
    let filteredBookings = bookings;
    
    if (params.filter && params.filter !== 'all') {
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
    }
    
    // Apply search if specified
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredBookings = filteredBookings.filter(booking => 
        booking.customerName.toLowerCase().includes(searchLower) ||
        booking.turfName.toLowerCase().includes(searchLower) ||
        booking.bookingId.toLowerCase().includes(searchLower) ||
        booking.customerPhone.includes(params.search)
      );
    }
    
    // Apply pagination
    const startIndex = (parseInt(params.page) || 0) * (parseInt(params.pageSize) || 25);
    const endIndex = startIndex + (parseInt(params.pageSize) || 25);
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);
    
    const result = {
      data: paginatedBookings,
      total: filteredBookings.length,
      page: parseInt(params.page) || 0,
      pageSize: parseInt(params.pageSize) || 25
    };
    
    console.log(`✅ Admin: Bookings fetched: ${paginatedBookings.length}/${filteredBookings.length} bookings (${bookings.length} total)`);
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

async function testAdminBookingsSync() {
  try {
    console.log('🧪 TESTING ADMIN BOOKINGS SYNC');
    console.log('==============================');
    
    // Test different scenarios
    const testCases = [
      { name: 'All Bookings', params: {} },
      { name: 'Pending Bookings', params: { filter: 'pending' } },
      { name: 'Today Bookings', params: { filter: 'today' } },
      { name: 'First Page (25 items)', params: { page: 0, pageSize: 25 } },
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📋 TEST: ${testCase.name}`);
      console.log('========================');
      
      const result = await simulateAdminGetBookings(testCase.params);
      
      console.log(`📊 Results: ${result.data.length} bookings returned`);
      console.log(`📊 Total: ${result.total} bookings match criteria`);
      console.log(`📊 Page: ${result.page}, Page Size: ${result.pageSize}`);
      
      if (result.data.length > 0) {
        console.log('✅ SUCCESS: Admin panel would show bookings');
        console.log('   Sample bookings:');
        result.data.forEach((booking, i) => {
          console.log(`   ${i + 1}. ${booking.bookingId} - ${booking.customerName} - ${booking.turfName} - ${booking.status} - PKR ${booking.totalAmount}`);
        });
      } else {
        console.log('❌ PROBLEM: Admin panel would show "No rows"');
      }
    }
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testAdminBookingsSync().then(() => {
  console.log('🏁 Test finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});