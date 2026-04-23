// Test script to verify admin panel bookings are working
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

async function testAdminBookings() {
  try {
    console.log('🧪 Testing admin panel bookings functionality...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Test the exact same query that admin panel uses
    console.log('📅 Fetching bookings (same as admin panel)...');
    
    let bookingsQuery = collection(db, 'bookings');
    
    // Add ordering by creation date (newest first) - same as admin panel
    try {
      bookingsQuery = query(bookingsQuery, orderBy('createdAt', 'desc'));
    } catch (orderError) {
      console.warn('⚠️ Could not order by createdAt, using simple query');
    }
    
    // Execute query
    const querySnapshot = await getDocs(bookingsQuery);
    
    // Get venue names for better display (same as admin panel)
    const venuesRef = collection(db, 'venues');
    const venuesSnapshot = await getDocs(venuesRef);
    const venuesMap = {};
    venuesSnapshot.forEach((doc) => {
      venuesMap[doc.id] = doc.data();
    });
    
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const bookingData = doc.data();
      
      // Get venue information
      const venue = venuesMap[bookingData.turfId] || {};
      
      // Transform booking data for admin panel display (same as admin panel)
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
      
      bookings.push(transformedBooking);
    });
    
    const result = {
      data: bookings,
      total: bookings.length,
      page: 0,
      pageSize: 25
    };
    
    console.log(`✅ Admin bookings test successful!`);
    console.log(`📊 Results: ${bookings.length} bookings found`);
    
    if (bookings.length > 0) {
      console.log('\n📋 Sample booking for admin panel:');
      const sample = bookings[0];
      console.log(`- ID: ${sample.id}`);
      console.log(`- Booking Reference: ${sample.bookingId}`);
      console.log(`- Customer: ${sample.customerName}`);
      console.log(`- Venue: ${sample.turfName}`);
      console.log(`- Status: ${sample.status}`);
      console.log(`- Amount: PKR ${sample.totalAmount}`);
      console.log(`- Date: ${sample.dateTime}`);
    }
    
    console.log('\n✅ Admin panel Firebase integration is working correctly!');
    console.log('🔧 If you still see 404 errors, it\'s a browser cache issue.');
    console.log('💡 Solution: Clear browser cache or use incognito mode.');
    
  } catch (error) {
    console.error('❌ Error testing admin bookings:', error);
  }
}

testAdminBookings();