// Debug script to check why bookings are not displaying in admin panel
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

async function debugAdminBookingsDisplay() {
  try {
    console.log('🔍 Debugging admin bookings display issue...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Step 1: Test basic bookings query
    console.log('\n📅 Step 1: Testing basic bookings query...');
    const bookingsRef = collection(db, 'bookings');
    const basicSnapshot = await getDocs(bookingsRef);
    console.log(`✅ Basic query: ${basicSnapshot.size} bookings found`);
    
    // Step 2: Test ordered query (same as admin panel)
    console.log('\n📅 Step 2: Testing ordered query...');
    let orderedQuery;
    try {
      orderedQuery = query(bookingsRef, orderBy('createdAt', 'desc'));
      const orderedSnapshot = await getDocs(orderedQuery);
      console.log(`✅ Ordered query: ${orderedSnapshot.size} bookings found`);
    } catch (orderError) {
      console.warn('⚠️ Ordered query failed:', orderError.message);
      console.log('Using basic query instead...');
      orderedQuery = bookingsRef;
    }
    
    // Step 3: Get venues for reference
    console.log('\n🏟️ Step 3: Getting venues for reference...');
    const venuesRef = collection(db, 'venues');
    const venuesSnapshot = await getDocs(venuesRef);
    const venuesMap = {};
    venuesSnapshot.forEach((doc) => {
      venuesMap[doc.id] = doc.data();
    });
    console.log(`✅ Venues loaded: ${Object.keys(venuesMap).length} venues`);
    
    // Step 4: Process bookings exactly like admin panel
    console.log('\n🔄 Step 4: Processing bookings (admin panel logic)...');
    const querySnapshot = await getDocs(orderedQuery);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const bookingData = doc.data();
      console.log(`\n📋 Processing booking ${doc.id}:`);
      console.log('Raw data:', JSON.stringify(bookingData, null, 2));
      
      // Get venue information
      const venue = venuesMap[bookingData.turfId] || {};
      console.log('Venue found:', venue.name || 'Unknown');
      
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
        createdAt: bookingData.createdAt?.toDate?.() || new Date(),
        updatedAt: bookingData.updatedAt?.toDate?.() || new Date(),
        userId: bookingData.userId,
        userType: bookingData.userType || 'guest',
        turfId: bookingData.turfId,
      };
      
      console.log('Transformed booking:', JSON.stringify(transformedBooking, null, 2));
      bookings.push(transformedBooking);
    });
    
    // Step 5: Create final result (same as admin panel)
    console.log('\n📊 Step 5: Creating final result...');
    const result = {
      data: bookings,
      total: bookings.length,
      page: 0,
      pageSize: 25
    };
    
    console.log('Final result:', JSON.stringify(result, null, 2));
    
    // Step 6: Check for potential issues
    console.log('\n🔍 Step 6: Checking for potential issues...');
    
    if (bookings.length === 0) {
      console.log('❌ No bookings processed - check raw data above');
    } else {
      console.log('✅ Bookings processed successfully');
      
      // Check for common issues
      bookings.forEach((booking, index) => {
        console.log(`\nBooking ${index + 1} checks:`);
        console.log(`- ID: ${booking.id ? '✅' : '❌'}`);
        console.log(`- Customer Name: ${booking.customerName !== 'Guest User' ? '✅' : '⚠️ Generic'}`);
        console.log(`- Venue Name: ${booking.turfName !== 'Unknown Venue' ? '✅' : '❌'}`);
        console.log(`- Amount: ${booking.totalAmount > 0 ? '✅' : '❌'}`);
        console.log(`- Status: ${booking.status ? '✅' : '❌'}`);
        console.log(`- Date: ${booking.dateTime ? '✅' : '❌'}`);
      });
    }
    
    console.log('\n🎯 Summary:');
    console.log(`- Raw bookings in database: ${basicSnapshot.size}`);
    console.log(`- Processed bookings: ${bookings.length}`);
    console.log(`- Venues available: ${Object.keys(venuesMap).length}`);
    
    if (bookings.length > 0) {
      console.log('\n✅ Admin panel should display these bookings');
      console.log('If not showing, check:');
      console.log('1. Browser console for JavaScript errors');
      console.log('2. Network tab for failed requests');
      console.log('3. Redux DevTools for state updates');
      console.log('4. DataGrid component rendering');
    } else {
      console.log('\n❌ No bookings to display - check database data');
    }
    
  } catch (error) {
    console.error('❌ Error debugging admin bookings display:', error);
  }
}

debugAdminBookingsDisplay();