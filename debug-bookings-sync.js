// Debug Bookings Sync Issue
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

async function debugBookings() {
  try {
    console.log('🔍 DEBUGGING BOOKINGS SYNC ISSUE');
    console.log('=================================');
    
    // Check bookings collection
    const bookingsRef = collection(db, 'bookings');
    const bookingsSnapshot = await getDocs(bookingsRef);
    
    console.log(`📊 Found ${bookingsSnapshot.size} total bookings in database`);
    console.log('');
    
    if (bookingsSnapshot.size === 0) {
      console.log('❌ No bookings found in database!');
      console.log('   This explains why admin panel shows "No rows"');
      return;
    }
    
    // Analyze each booking
    bookingsSnapshot.forEach((doc, index) => {
      const booking = doc.data();
      console.log(`📋 BOOKING ${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Status: ${booking.status || 'undefined'}`);
      console.log(`   Payment Status: ${booking.paymentStatus || 'undefined'}`);
      console.log(`   User ID: ${booking.userId || 'undefined'}`);
      console.log(`   User Type: ${booking.userType || 'undefined'}`);
      console.log(`   Turf ID: ${booking.turfId || 'undefined'}`);
      console.log(`   Time Slot: ${booking.timeSlot || booking.slot?.startTime || 'undefined'}`);
      console.log(`   Total Amount: ${booking.totalAmount || 'undefined'}`);
      console.log(`   Booking Reference: ${booking.bookingReference || 'undefined'}`);
      
      // Check date fields
      if (booking.date) {
        if (booking.date.toDate) {
          console.log(`   Date: ${booking.date.toDate().toISOString()}`);
        } else {
          console.log(`   Date: ${booking.date}`);
        }
      } else {
        console.log(`   Date: undefined`);
      }
      
      // Check created date
      if (booking.createdAt) {
        if (booking.createdAt.toDate) {
          console.log(`   Created At: ${booking.createdAt.toDate().toISOString()}`);
        } else {
          console.log(`   Created At: ${booking.createdAt}`);
        }
      } else {
        console.log(`   Created At: undefined`);
      }
      
      console.log('   ----------------------------------------');
    });
    
    // Test admin panel query
    console.log('🔍 TESTING ADMIN PANEL QUERY');
    console.log('=============================');
    
    try {
      // Simulate admin panel query with ordering
      const adminQuery = query(bookingsRef, orderBy('createdAt', 'desc'));
      const adminSnapshot = await getDocs(adminQuery);
      
      console.log(`📊 Admin query returned: ${adminSnapshot.size} bookings`);
      
      if (adminSnapshot.size > 0) {
        console.log('✅ Admin panel should see bookings');
        adminSnapshot.forEach((doc, index) => {
          const booking = doc.data();
          console.log(`   ${index + 1}. ${booking.bookingReference || doc.id} - ${booking.status} - ${booking.totalAmount || 0} PKR`);
        });
      } else {
        console.log('❌ Admin panel query returns no results');
        console.log('   This could be due to:');
        console.log('   - Missing createdAt field in bookings');
        console.log('   - Firestore index not ready');
        console.log('   - Query filter issues');
      }
    } catch (queryError) {
      console.log('❌ Admin panel query failed:', queryError.message);
      console.log('   This is likely why admin panel shows "No rows"');
      
      // Try simple query without ordering
      console.log('   Trying simple query without ordering...');
      const simpleSnapshot = await getDocs(bookingsRef);
      console.log(`   Simple query returned: ${simpleSnapshot.size} bookings`);
    }
    
    console.log('');
    console.log('✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug
debugBookings().then(() => {
  console.log('🏁 Debug finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});